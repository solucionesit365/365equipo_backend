import fetch from "node-fetch";
import { config } from "dotenv";
import pkg from "mssql";
const { ConnectionPool } = pkg;
import { URLSearchParams } from "url";

config();

const sqlConfig = {
  user: "sa",
  password: "ffffffff",
  server: "silema.hiterp.com",
  database: "Fac_Tena",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const apiConfig = {
  baseURL: "https://api.businesscentral.dynamics.com",
  companyID: "0d96d05c-2a10-ee11-8f6e-6045bd978b14",
  auth: "Bearer " + process.env.API_TOKEN,
};

//-----------------------------------------------------------------------------------------------------------------------------------------------
//ItemCategories / Famílias ---------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_ItemCategories() {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    result = await pool
      .request()
      .query("SELECT left(nom, 20) Code, Nom FROM Families");
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Nom);
    // Get ItemCategory from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/itemCategories?$filter=code eq '${row.Code}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If ItemCategory Does Not Exist, Create New ItemCategory
    if (response.status === 404) {
    } else if (response.ok) {
      const itemCategory = await response.json();

      if (itemCategory.value.length === 0) {
        console.log("If itemCategory Does Not Exist, Create New itemCategory");
        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/itemCategories`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: row.Code,
              displayName: row.Nom,
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);
      } else {
        console.log(
          "If itemCategory Exists, Update itemCategory " +
            itemCategory.value[0].id,
        );
        let ifMatch = itemCategory.value[0]["@odata.etag"];

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/itemCategories(${itemCategory.value[0].id})`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              "if-Match": ifMatch,
            },
            body: JSON.stringify({
              code: row.Code,
              displayName: row.Nom,
            }),
          },
        );

        const responseJson = await response.json();
        console.log(responseJson);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

//Obetener Id del ItemCategory/Familia
async function getItemCategoryId(categoryCode) {
  let token = await obtainToken();

  // Get category from API
  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/itemCategories?$filter=code eq '${categoryCode}'`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  let itemCategoryId;
  if (response.status === 404) {
    itemCategoryId = "";
  } else if (response.ok) {
    const itemCategory = await response.json();
    if (itemCategory.value.length === 0) {
      itemCategoryId = "";
    } else {
      itemCategoryId = itemCategory.value[0].id;
    }
  } else {
    itemCategoryId = "";
  }

  return itemCategoryId;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
// Items / Artículos ----------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function getItemFromAPI(itemCodi) {
  let itemId = "";

  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    result = await pool
      .request()
      .query(
        "SELECT a.Codi, a.Nom, a.Preu/(1+(t.Iva/100)) Preu, left(a.Familia, 20) Familia, a.EsSumable, t.Iva FROM (select codi, nom, preu, familia, esSumable, tipoIva from Articles union all select codi, nom, preu, familia, esSumable, tipoIva from articles_Zombis) a left join tipusIva2012 t on a.Tipoiva=t.Tipus where codi = " +
          itemCodi,
      );
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    //Category/Familia
    let categoryId = await getItemCategoryId(row.Familia);

    //Unidad de medida (obligatorio)
    let baseUnitOfMeasure;
    if (row.EsSumable === 0) {
      baseUnitOfMeasure = "001"; //A peso
    } else {
      baseUnitOfMeasure = "002"; //Por unidades
    }

    //IVA
    let ivaItem = row.Iva;

    console.log(
      "-------------------------------------------------------------",
    );
    console.log(row.Nom);
    console.log("FAMILIA: " + categoryId);
    console.log("UNIDAD DE MEDIDA: " + baseUnitOfMeasure);
    console.log("IVA: " + ivaItem);
    console.log(
      "-------------------------------------------------------------",
    );

    // Get Item from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/items?$filter=number eq 'CODI-${row.Codi}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Item Does Not Exist, Create New Item
    if (response.status === 404) {
    } else if (response.ok) {
      const item = await response.json();

      if (item.value.length === 0) {
        console.log("If Item Does Not Exist, Create New Item");
        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/items`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: "CODI-" + row.Codi,
              displayName: row.Nom,
              generalProductPostingGroupCode: "IVA " + ivaItem,
              unitPrice: row.Preu,
              //priceIncludesTax: true,
              itemCategoryId: categoryId,
              baseUnitOfMeasureCode: baseUnitOfMeasure,
              inventoryPostingGroupCode: "001",
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);

        itemId = responseJson.id;
      } else {
        console.log("If Item Exists, Update Item " + item.value[0].id);
        let ifMatch = item.value[0]["@odata.etag"];
        itemId = item.value[0].id;

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/items(${item.value[0].id})`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              "if-Match": ifMatch,
            },
            body: JSON.stringify({
              displayName: row.Nom,
              generalProductPostingGroupCode: "IVA " + ivaItem,
              unitPrice: row.Preu,
              priceIncludesTax: false,
              itemCategoryId: categoryId,
              baseUnitOfMeasureCode: baseUnitOfMeasure,
              inventoryPostingGroupCode: "001",
            }),
          },
        );

        const responseJson = await response.json();
        console.log(responseJson);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();

  return itemId;
}

//Eliminar artículos (Items) con precio 0
async function deleteWithAPI_Items() {
  // Get the authentication token
  let token = await obtainToken();
  // Get Item from API

  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/items`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
    console.error("Error communicating with API", await response.text());
  } else {
    if (response.ok) {
      const item = await response.json();
      if (item.value.length === 0) {
        console.error("Error communicating with API", await response.text());
      } else {
        console.log("nItems: " + item.value.length);
        for (let i = 0; i < item.value.length; i++) {
          if (item.value[i].unitPrice === 0) {
            console.log(
              "NO TIENE PRECIO. LO BORRAMOS !!! " + item.value[i].displayName,
            );

            let ifMatch = item.value[i]["@odata.etag"];

            response = await fetch(
              `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/items(${item.value[i].id})`,
              {
                method: "DELETE",
                headers: {
                  Authorization: "Bearer " + token,
                  "Content-Type": "application/json",
                  "if-Match": ifMatch,
                },
              },
            );
          }
        }
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Clientes --------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function getClientsFinalsFromAPI(codiClient) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    //select cast(c.Codi as nvarchar) Codi, c.Nom, c.Adresa, c.Ciutat, c.CP, cc1.valor, cc2.valor Tel from clients c left join constantsClient cc1 on c.codi=cc1.codi and cc1.variable='EMAIL' left join constantsClient cc2 on c.codi=cc2.codi and cc2.variable='TEL'
    result = await pool
      .request()
      .query(
        "select top 10 id,Nom,Telefon,Adreca,emili,Descompte,Altres,Nif,idExterna from clientsfinals",
      );
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  let customerId = "";

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Nom);
    // Get Customer from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Customer Does Not Exist, Create New Customer
    if (response.status === 404) {
    } else if (response.ok) {
      const customer = await response.json();

      if (customer.value.length === 0) {
        console.log("If customer Does Not Exist, Create New customer");
        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: row.Codi,
              displayName: row.Nom,
              type: "Company",
              currencyCode: "EUR",
              paymentMethodId: "ebb54901-3110-ee11-8f6e-6045bd978b14", //CAJA
              addressLine1: row.Adresa,
              //addressLine2: '',
              city: row.Ciutat,
              //state: '',
              //country: '',
              postalCode: row.CP,
              //phoneNumber: '',
              //email: '',
              //website: '',
              //salespersonCode: '',
              //balanceDue: 0,
              //creditLimit: 0,
              //taxLiable: false,
              //taxRegistrationNumber: '', (NIF)
              //currencyId: '00000000-0000-0000-0000-000000000000',
              //shipmentMethodId: '00000000-0000-0000-0000-000000000000',
              //blocked: '_x0020_',
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);

        customerId = responseJson.id;
      } else {
        console.log(
          "If customer Exists, Update customer " + customer.value[0].id,
        );

        let ifMatch = customer.value[0]["@odata.etag"];

        customerId = customer.value[0].id;

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customerReturnReasons(${customer.value[0].id})`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          },
        );
        const responseJson00 = await response.json();
        console.log(responseJson00);

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers(${customer.value[0].id})`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              "if-Match": ifMatch,
            },
            body: JSON.stringify({
              displayName: row.Nom,
              type: "Company",
              taxAreaId: taxId,
              currencyCode: "EUR",
              paymentTermsId: payTermId,
              paymentMethodId: "ebb54901-3110-ee11-8f6e-6045bd978b14", //CAJA
              addressLine1: row.Adresa,
              city: row.Ciutat,
              postalCode: row.CP,
              //businessGroup: 'UE',
            }),
          },
        );

        const responseJson = await response.json();
        console.log(responseJson);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
  return customerId;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Clientes --------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function getCustomerFromAPI(codiClient) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    //select cast(c.Codi as nvarchar) Codi, c.Nom, c.Adresa, c.Ciutat, c.CP, cc1.valor, cc2.valor Tel from clients c left join constantsClient cc1 on c.codi=cc1.codi and cc1.variable='EMAIL' left join constantsClient cc2 on c.codi=cc2.codi and cc2.variable='TEL'
    result = await pool
      .request()
      .query(
        "SELECT cast(c.Codi as nvarchar) Codi, c.Nom, c.Adresa, c.Ciutat, c.CP from clients c where codi = " +
          codiClient,
      );
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  let customerId = "";
  let payTermId = await getPaymentTermId("0D");
  let taxId = await getTaxAreaId("UE");

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Nom);
    // Get Customer from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers?$filter=number eq '${row.Codi}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Customer Does Not Exist, Create New Customer
    if (response.status === 404) {
    } else if (response.ok) {
      const customer = await response.json();

      if (customer.value.length === 0) {
        console.log("If customer Does Not Exist, Create New customer");
        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: row.Codi,
              displayName: row.Nom,
              type: "Company",
              taxAreaId: taxId,
              currencyCode: "EUR",
              paymentTermsId: payTermId,
              paymentMethodId: "ebb54901-3110-ee11-8f6e-6045bd978b14", //CAJA
              addressLine1: row.Adresa,
              //addressLine2: '',
              city: row.Ciutat,
              //state: '',
              //country: '',
              postalCode: row.CP,
              //phoneNumber: '',
              //email: '',
              //website: '',
              //salespersonCode: '',
              //balanceDue: 0,
              //creditLimit: 0,
              //taxLiable: false,
              //taxRegistrationNumber: '', (NIF)
              //currencyId: '00000000-0000-0000-0000-000000000000',
              //shipmentMethodId: '00000000-0000-0000-0000-000000000000',
              //blocked: '_x0020_',
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);

        customerId = responseJson.id;
      } else {
        console.log(
          "If customer Exists, Update customer " + customer.value[0].id,
        );

        let ifMatch = customer.value[0]["@odata.etag"];

        customerId = customer.value[0].id;

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customerReturnReasons(${customer.value[0].id})`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          },
        );
        const responseJson00 = await response.json();
        console.log(responseJson00);

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/customers(${customer.value[0].id})`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              "if-Match": ifMatch,
            },
            body: JSON.stringify({
              displayName: row.Nom,
              type: "Company",
              taxAreaId: taxId,
              currencyCode: "EUR",
              paymentTermsId: payTermId,
              paymentMethodId: "ebb54901-3110-ee11-8f6e-6045bd978b14", //CAJA
              addressLine1: row.Adresa,
              city: row.Ciutat,
              postalCode: row.CP,
              //businessGroup: 'UE',
            }),
          },
        );

        const responseJson = await response.json();
        console.log(responseJson);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
  return customerId;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Trabajadores ----------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_Employees() {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    result = await pool
      .request()
      .query(
        `SELECT cast(Codi as nvarchar) Codi, left(Nom, 30) Nom from dependentes order by nom`,
      );
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Nom);
    // Get Employees from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/employees?$filter=number eq '${row.Codi}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Employees Does Not Exist, Create New Employees
    if (response.status === 404) {
    } else if (response.ok) {
      const employees = await response.json();

      if (employees.value.length === 0) {
        console.log("If employees Does Not Exist, Create New employees");
        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/employees`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: row.Codi,
              givenName: row.Nom,
              middleName: "",
              surname: row.Nom,
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);
      } else {
        console.log(
          "If employees Exists, Update employees " + employees.value[0].id,
        );

        let ifMatch = employees.value[0]["@odata.etag"];

        response = await fetch(
          `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/employees(${employees.value[0].id})`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
              "if-Match": ifMatch,
            },
            body: JSON.stringify({
              givenName: row.Nom,
              middleName: "",
              surname: row.Nom,
              // Update additional fields as necessary...
            }),
          },
        );
        const responseJson = await response.json();
        console.log(responseJson);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Tiquets Cabeceras -----------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_SalesTiquets(
  tabVenut,
  tabMoviments,
  botiga,
) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    let sql;
    sql =
      "select num_tick nTickHit, convert(varchar, v.Data, 23) Data, concat(upper(c.nom), '_', num_tick) Num_tick, case isnull(m.motiu, 'CAJA') when 'CAJA' then 'CAJA' else 'TARJETA' end FormaPago, isnull(c2.codi, '1314') Client, sum(v.import) Total ";
    sql = sql + "From " + tabVenut + " v  ";
    sql =
      sql +
      "left join " +
      tabMoviments +
      " m on m.botiga=v.botiga and concat('Pagat Targeta: ', v.num_tick) = m.motiu ";
    sql = sql + "left join clients c on v.botiga=c.codi  ";
    sql =
      sql +
      "left join ClientsFinals cf on concat('[Id:', cf.id, ']') = v.otros ";
    sql =
      sql +
      "left join clients c2 on case charindex('AbonarEn:',altres) when 0 then '' else substring(cf.altres, charindex('AbonarEn:', cf.altres)+9, charindex(']', cf.altres, charindex('AbonarEn:', cf.altres)+9)-charindex('AbonarEn:', cf.altres)-9) end =c2.codi ";
    sql =
      sql +
      "where v.botiga=" +
      botiga +
      " and day(v.data)>=4 and num_tick>=574714 ";
    sql =
      sql +
      "group by v.data, num_tick, concat(upper(c.nom), '_', num_tick), case isnull(m.motiu, 'CAJA') when 'CAJA' then 'CAJA' else 'TARJETA' end, isnull(c2.codi, '1314') ";
    sql = sql + "order by v.data";
    result = await pool.request().query(sql);
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Num_tick);
    // Get Sale from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices?$filter=externalDocumentNumber eq '${row.Num_tick}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Sale Does Not Exist, Create New Sale
    if (response.status === 404) {
    } else if (response.ok) {
      const sale = await response.json();

      if (sale.value.length === 0) {
        console.log("If Sale Does Not Exist, Create New Sale");
        // Get Customer from API
        const customerId = await getCustomerFromAPI(row.Client);

        if (customerId != "") {
          response = await fetch(
            `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                externalDocumentNumber: row.Num_tick,
                invoiceDate: row.Data,
                postingDate: row.Data,
                customerId: customerId,

                // Add additional fields as necessary...
              }),
            },
          );
        }
        const responseJson = await response.json();
        console.log(responseJson);

        console.log("AÑADIR LINEAS DEL TIQUET: " + responseJson.id);
        await synchronizeTableWithAPI_SalesTiquetsLines(
          tabVenut,
          botiga,
          row.nTickHit,
          responseJson.id,
        ).catch(console.error);
      } else {
        console.log(sale);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Tiquets Lineas --------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_SalesTiquetsLines(
  tabVenut,
  botiga,
  nTickHit,
  id365,
) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  console.log(
    "SALE LINES " + id365 + "---------------------------------------------",
  );
  // Query SQL Server Table
  let result;
  try {
    let sql;
    sql =
      "select concat(upper(c.nom), '_', num_tick) Num_tick, v.Quantitat, CAST(v.Plu as varchar) Plu ";
    sql = sql + "From " + tabVenut + " v ";
    sql = sql + "left join clients c on v.botiga=c.codi  ";
    sql = sql + "where v.botiga=" + botiga + " and num_tick='" + nTickHit + "'";
    result = await pool.request().query(sql);
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.Num_tick);
    // Get Sale from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices(${id365})/salesInvoiceLines?$filter=lineObjectNumber eq 'CODI-${row.Plu}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Sale Does Not Exist, Create New Sale
    if (response.status === 404) {
    } else if (response.ok) {
      const sale = await response.json();

      if (sale.value.length === 0) {
        console.log("If Sale Does Not Exist, Create New Sale");
        // Get Item from API
        const itemId = await getItemFromAPI(row.Plu);

        if (itemId != "") {
          response = await fetch(
            `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices(${id365})/salesInvoiceLines`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                documentId: id365,
                itemId: itemId,
                quantity: row.Quantitat,

                // Add additional fields as necessary...
              }),
            },
          );
        }
        const responseJson = await response.json();
        console.log(responseJson);
      } else {
        console.log(sale);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Facturas Cabeceras ----------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_SalesFacturas(
  tabFacturacio,
  nFactura,
  serie,
) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    let sql;
    sql =
      "select idFactura, concat(serie, numfactura) nFac, convert(varchar, datafactura, 23) Data, clientCodi Client from " +
      tabFacturacio +
      " where numFactura=" +
      nFactura +
      " and serie='" +
      serie +
      "'";
    result = await pool.request().query(sql);
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    console.log(row.nFac);
    // Get Sale from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices?$filter=externalDocumentNumber eq '${row.nFac}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Sale Does Not Exist, Create New Sale
    if (response.status === 404) {
    } else if (response.ok) {
      const sale = await response.json();

      if (sale.value.length === 0) {
        console.log("If Sale Does Not Exist, Create New Sale");
        // Get Customer from API
        const customerId = await getCustomerFromAPI(row.Client);
        console.log("CUSTOMER ID: " + customerId);
        if (customerId != "") {
          response = await fetch(
            `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                externalDocumentNumber: row.nFac,
                invoiceDate: row.Data,
                postingDate: row.Data,
                customerId: customerId,

                // Add additional fields as necessary...
              }),
            },
          );
          const responseJson = await response.json();
          console.log("SALE--------------------------------");
          console.log(responseJson);

          console.log("AÑADIR LINEAS DE LA FACTURA: " + responseJson.id);
          if (responseJson.id != "") {
            await synchronizeTableWithAPI_SalesFacLines(
              row.idFactura,
              row.Data,
              responseJson.id,
            ).catch(console.error);
          }
        }
      } else {
        console.log(sale);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//Facturas Lineas --------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
async function synchronizeTableWithAPI_SalesFacLines(idFactura, data, id365) {
  // Create Connection Pool
  let pool = new ConnectionPool(sqlConfig);
  pool = await pool.connect();

  // Query SQL Server Table
  let result;
  try {
    let sql;
    sql =
      "select producte Plu, Preu, sum(servit)-sum(Tornat) Quantitat from [facturacio_2023-01_data] where idfactura='" +
      idFactura +
      "' group by producte, preu";
    result = await pool.request().query(sql);
  } catch (err) {
    console.error("Error querying SQL Server", err);
    pool.close();
    return;
  }

  // Get the authentication token
  let token = await obtainToken();

  // Loop Through Each Record in SQL Table
  for (const row of result.recordset) {
    // Get Sale from API
    let response = await fetch(
      `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices(${id365})/salesInvoiceLines?$filter=lineObjectNumber eq 'CODI-${row.Plu}'`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    // If Sale Does Not Exist, Create New Sale
    if (response.status === 404) {
    } else if (response.ok) {
      const sale = await response.json();

      if (sale.value.length === 0) {
        console.log("If Sale Line Does Not Exist, Create New Sale Line");
        // Get Item from API
        const itemId = await getItemFromAPI(row.Plu);
        console.log("ITEM ID: " + itemId);
        if (itemId != "") {
          response = await fetch(
            `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices(${id365})/salesInvoiceLines`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                documentId: id365,
                itemId: itemId,
                quantity: row.Quantitat,
                unitPrice: row.Preu,
                // Add additional fields as necessary...
              }),
            },
          );
        }
        const responseJson = await response.json();
        console.log(responseJson);
      } else {
        console.log(sale);
      }
    } else {
      console.error("Error communicating with API", await response.text());
    }
  }

  pool.close();
}

async function getSalesInvoiceFromAPI(docNumber) {
  // Get the authentication token
  let token = await obtainToken();

  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/salesInvoices?$filter=externalDocumentNumber eq '${docNumber}'`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
    console.log("kk");
  } else if (response.ok) {
    const salesInvoiceLines = await response.json();
    console.log(salesInvoiceLines);
  }
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
//OTROS -----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------

async function getPaymentMethodsFromAPI() {
  // Get the authentication token
  let token = await obtainToken();
  // Get Tax from API

  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/paymentMethods`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
    console.log("kk");
  } else if (response.ok) {
    const payMethods = await response.json();
    console.log(payMethods);
  }
}

//Obetener Id del modo de pago
async function getPaymentTermId(pTermCode) {
  let token = await obtainToken();

  // Get PaymentTerms from API
  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/paymentTerms?$filter=dueDateCalculation eq '` +
      pTermCode +
      `'`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  let payTermId;
  if (response.status === 404) {
  } else if (response.ok) {
    const payTerm = await response.json();
    if (payTerm.value.length === 0) {
      payTermId = "";
    } else {
      payTermId = payTerm.value[0].id;
    }
  } else {
    payTermId = "";
  }
  return payTermId;
}

async function getTaxAreasFromAPI() {
  // Get the authentication token
  let token = await obtainToken();
  // Get Tax from API
  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/taxAreas`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
  } else if (response.ok) {
    const taxAreas = await response.json();
    console.log(taxAreas);
  }
}

async function getTaxGroupsFromAPI() {
  // Get the authentication token
  let token = await obtainToken();
  // Get Tax from API
  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/taxGroups`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
  } else if (response.ok) {
    const taxGroups = await response.json();
    console.log(taxGroups);
  }
}

//Obetener Id de TaxArea
async function getTaxAreaId(taxCode) {
  let token = await obtainToken();

  // Get Tax from API
  let response = await fetch(
    `${apiConfig.baseURL}/v2.0/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/production/api/v2.0/companies(${apiConfig.companyID})/taxAreas?$filter=code eq '` +
      taxCode +
      `'`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
  );

  let taxId;
  if (response.status === 404) {
  } else if (response.ok) {
    const tax = await response.json();
    if (tax.value.length === 0) {
      taxId = "";
    } else {
      taxId = tax.value[0].id;
    }
  } else {
    taxId = "";
  }
  return taxId;
}

async function obtainToken() {
  const url =
    "https://login.microsoftonline.com/ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96/oauth2/v2.0/token";
  const params = new URLSearchParams();

  params.append("tenant", "ace8eb1f-b96c-4ab5-91ae-4a66ffd58c96");
  params.append("token_type", "Bearer");
  params.append("grant_type", "client_credentials");
  params.append("client_id", "a9a6ff14-bcc4-4cb5-a477-9be8d0b68a9e");
  params.append("client_secret", "vAh8Q~BKbBROXYL_k4.8cnU5gs4yM13fa302uaGv");
  params.append("scope", "https://api.businesscentral.dynamics.com/.default");

  const response = await fetch(url, {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!response.ok) {
    throw new Error("Failed to obtain access token");
  }

  const data = await response.json();
  return data.access_token;
}

//FAMILIAS
//synchronizeTableWithAPI_ItemCategories().catch(console.error);

//ARTICULOS - ITEMS
//getItemFromAPI('103').catch(console.error);
//deleteWithAPI_Items().catch(console.error);

//EMPLEADOS
//synchronizeTableWithAPI_Employees().catch(console.error);

//CLIENTs Finals
getClientsFinalsFromAPI("5337").catch(console.error);

//CLIENTES
//getCustomerFromAPI('5337').catch(console.error);
//getCustomerFromAPI('6059').catch(console.error);

//VENTAS
//synchronizeTableWithAPI_SalesTiquets('[v_venut_2023-03]', '[v_moviments_2023-03]', '888').catch(console.error);
//getSalesInvoiceFromAPI('xxx').catch(console.error);

//FACTURAS
//synchronizeTableWithAPI_SalesFacturas('[Facturacio_2023-01_iva]', '2', 'I2023/RC/').catch(console.error);

//getTaxAreasFromAPI().catch(console.error);
//getTaxGroupsFromAPI().catch(console.error);