import { Injectable, Logger } from "@nestjs/common";
import * as mailchimp from "@mailchimp/mailchimp_marketing";
import { createHash } from "crypto";

/**
 * Service for Mailchimp integration
 * Handles contact subscription to Mailchimp lists
 */
@Injectable()
export class MailchimpService {
  private readonly logger = new Logger(MailchimpService.name);
  private readonly isConfigured: boolean;

  constructor() {
    // Configure Mailchimp with environment credentials
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    this.isConfigured = !!(apiKey && serverPrefix);

    if (this.isConfigured) {
      mailchimp.setConfig({
        apiKey: apiKey,
        server: serverPrefix,
      });
      this.logger.log("Mailchimp configured successfully");
    } else {
      this.logger.warn(
        "Mailchimp is not configured. Check environment variables MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX",
      );
    }
  }

  /**
   * Subscribe or update a contact in Mailchimp
   * @param email Contact email
   * @param firstName Contact first name
   * @param lastName Contact last name
   * @param phone Contact phone number
   * @param postalCode Postal code
   * @param tags Array of tags to categorize the contact
   * @returns Promise with operation result
   */
  async subscribeContact(
    email: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
    postalCode?: string,
    tags: string[] = [],
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isConfigured) {
      this.logger.warn("Subscription attempt without Mailchimp configuration");
      return {
        success: false,
        error: "Mailchimp is not configured",
      };
    }

    try {
      const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

      if (!audienceId) {
        throw new Error("MAILCHIMP_AUDIENCE_ID is not configured");
      }

      // Generate MD5 hash of email (required by Mailchimp)
      const subscriberHash = this.getSubscriberHash(email);

      // Prepare contact data using your audience fields
      const mergeFields: any = {};

      // Basic audience fields
      if (firstName) mergeFields.FNAME = firstName; // First Name → *|FNAME|* or *|MERGE1|*
      if (lastName) mergeFields.LNAME = lastName; // Last Name → *|LNAME|* or *|MERGE2|*
      if (phone) mergeFields.PHONE = phone; // Phone Number → *|PHONE|* or *|MERGE4|*

      // Full Name (combination of first and last name) → *|MMERGE6|* or *|MERGE6|*
      if (firstName && lastName) {
        mergeFields.MMERGE6 = `${firstName} ${lastName}`;
      } else if (firstName) {
        mergeFields.MMERGE6 = firstName;
      }

      // Address with postal code → *|ADDRESS|* or *|MERGE3|*
      if (postalCode) {
        mergeFields.ADDRESS = {
          zip: postalCode,
        };
      }

      // Try to add or update the contact
      const response = await mailchimp.lists.setListMember(
        audienceId,
        subscriberHash,
        {
          email_address: email,
          status_if_new: "subscribed",
          merge_fields: mergeFields,
        },
      );

      this.logger.log(`Contact ${email} subscribed/updated in Mailchimp`);

      // Add tags if provided
      if (tags.length > 0) {
        await this.addTags(email, tags);
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error(
        `Error subscribing contact ${email} to Mailchimp:`,
        error.response?.body || error.message,
      );

      return {
        success: false,
        error: error.response?.body?.detail || error.message,
      };
    }
  }

  /**
   * Add tags to an existing contact
   * @param email Contact email
   * @param tags Array of tags to add
   * @returns Promise with operation result
   */
  async addTags(
    email: string,
    tags: string[],
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "Mailchimp is not configured",
      };
    }

    try {
      const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

      if (!audienceId) {
        throw new Error("MAILCHIMP_AUDIENCE_ID is not configured");
      }

      const subscriberHash = this.getSubscriberHash(email);

      const tagsData = {
        tags: tags.map((tag) => ({
          name: tag,
          status: "active" as const,
        })),
      };

      await mailchimp.lists.updateListMemberTags(
        audienceId,
        subscriberHash,
        tagsData,
      );

      this.logger.log(`Tags added to ${email}: ${tags.join(", ")}`);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Error adding tags to ${email}:`,
        error.response?.body || error.message,
      );

      return {
        success: false,
        error: error.response?.body?.detail || error.message,
      };
    }
  }

  /**
   * Generate MD5 hash of email (required by Mailchimp API)
   * @param email Contact email
   * @returns MD5 hash of email in lowercase
   */
  private getSubscriberHash(email: string): string {
    return createHash("md5").update(email.toLowerCase()).digest("hex");
  }

  /**
   * Check if the service is configured correctly
   * @returns true if configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}
