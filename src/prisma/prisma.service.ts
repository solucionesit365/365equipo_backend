import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

// Get the APM instance that was initialized in main.ts
const apm = require("elastic-apm-node");

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private activeSpans = new Map<string, any>();

  constructor() {
    super({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });

    // Listen to Prisma query events to capture SQL
    this.$on("query" as never, (event: Prisma.QueryEvent) => {
      // Find the active span for this query using the query hash or target
      const queryId = `${event.target}_${Date.now()}`;
      const span = this.activeSpans.get(queryId) || apm.currentSpan;
      
      if (span && span.type === "db" && span.subtype === "postgresql") {
        // Attach SQL to the span
        span.setLabel("db_statement", event.query);
        span.setLabel("db_query_duration_ms", event.duration);
        if (event.params) {
          // Truncate params if too long to avoid issues
          const paramsStr = event.params.length > 1000 
            ? event.params.substring(0, 1000) + "..." 
            : event.params;
          span.setLabel("db_query_params", paramsStr);
        }
      }
    });

    // Create proxy to intercept all Prisma model method calls
    this.instrumentPrismaClient();
  }

  private instrumentPrismaClient() {
    // Proxy all model properties to intercept queries
    // We'll do this after connection in onModuleInit
  }
  
  private proxyModels() {
    // Iterate over all enumerable properties (including from prototype)
    for (const prop in this) {
      // Skip internal Prisma methods and our own methods
      if (prop.startsWith("$") || 
          prop === "activeSpans" || 
          prop === "instrumentPrismaClient" || 
          prop === "proxyModels" || 
          prop === "createModelProxy") {
        continue;
      }
      
      try {
        const value = (this as any)[prop];
        // Check if it's a model (has findFirst method which is common to all Prisma models)
        if (value && typeof value === "object" && typeof value.findFirst === "function") {
          // Replace with proxied version
          (this as any)[prop] = this.createModelProxy(value, prop);
        }
      } catch (error) {
        // Skip properties that can't be accessed
        continue;
      }
    }
  }

  private createModelProxy(model: any, modelName: string) {
    return new Proxy(model, {
      get: (target, prop: string) => {
        const originalMethod = target[prop];
        
        // Only intercept query methods (findMany, findFirst, create, update, delete, etc.)
        if (typeof originalMethod === "function" && 
            (prop.startsWith("find") || prop.startsWith("create") || 
             prop.startsWith("update") || prop.startsWith("delete") ||
             prop.startsWith("upsert") || prop.startsWith("count") ||
             prop.startsWith("aggregate") || prop.startsWith("groupBy"))) {
          
          return async (...args: any[]) => {
            const startTime = Date.now();
            const operationName = `${modelName}.${prop}`;
            
            // Create APM span for database operation
            const span = apm.startSpan(operationName, "db", "postgresql", {
              exitSpan: true,
            });

            if (span) {
              // Set span context with query metadata
              span.setLabel("db_system", "postgresql");
              span.setLabel("db_name", "postgresql");
              span.setLabel("db_operation", prop);
              span.setLabel("prisma_model", modelName);
              span.setLabel("prisma_action", prop);

              // Capture query parameters
              if (args.length > 0 && args[0]) {
                try {
                  const params = args[0];
                  if (params.where) {
                    const whereStr = JSON.stringify(params.where);
                    span.setLabel("db_query_where", whereStr.length > 500 ? whereStr.substring(0, 500) + "..." : whereStr);
                  }
                  if (params.select) {
                    span.setLabel("db_query_select", JSON.stringify(params.select));
                  }
                  if (params.include) {
                    span.setLabel("db_query_include", JSON.stringify(params.include));
                  }
                  if (params.data) {
                    const dataKeys = Object.keys(params.data);
                    span.setLabel("db_query_data_keys", JSON.stringify(dataKeys));
                  }
                  if (params.orderBy) {
                    span.setLabel("db_query_orderBy", JSON.stringify(params.orderBy));
                  }
                  if (params.take !== undefined) {
                    span.setLabel("db_query_take", params.take);
                  }
                  if (params.skip !== undefined) {
                    span.setLabel("db_query_skip", params.skip);
                  }
                } catch (error) {
                  // Ignore serialization errors
                }
              }
            }

            try {
              // Execute the original method
              const result = await originalMethod.apply(target, args);
              const duration = Date.now() - startTime;

              if (span) {
                span.setLabel("db_duration_ms", duration);
                const resultCount = Array.isArray(result) ? result.length : result ? 1 : 0;
                span.setLabel("db_result_count", resultCount);
                span.setOutcome("success");
                span.end();
              }

              return result;
            } catch (error) {
              const duration = Date.now() - startTime;

              if (span) {
                span.setLabel("db_duration_ms", duration);
                span.setLabel("error", true);
                span.setLabel("error_message", error instanceof Error ? error.message : String(error));
                span.setLabel("error_type", error instanceof Error ? error.constructor.name : "Unknown");
                span.setOutcome("failure");
                
                // Capture error in APM
                if (error instanceof Error) {
                  apm.captureError(error);
                }
                
                span.end();
              }

              // Re-throw the error
              throw error;
            }
          };
        }
        
        return originalMethod;
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    // Proxy models after connection to ensure they're available
    this.proxyModels();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
