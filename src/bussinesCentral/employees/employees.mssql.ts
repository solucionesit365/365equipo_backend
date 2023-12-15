import { recSoluciones } from "../../bbdd/mssql";

export async function addEmployees(employees: any[]) {
  let sql = "";

  for (let index = 0; index < employees.length; index++) {
    if (employees[index].number) {
      sql += `
      INSERT INTO employees (givenName, numberMBC)
      VALUES ('${employees[index].givenName}', '${employees[index].number}');`;
    }
  }
  if (sql != "") {
    console.log("guardando.....");

    const resNuevas = await recSoluciones("test_soluciones", sql);
    if (resNuevas.rowsAffected[0] > 0) return true;
  }
  return false;
}
