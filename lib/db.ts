// lib/db.ts
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool; 

//Zamiast otwierać nowe połączenie z bazą za każdym razem,

//-tworzysz jedno wspólne miejsce, które:
//-przechowuje kilka otwartych połączeń z MySQL,
//-pozwala aplikacji szybciej wykonywać zapytania,
//-daje większą stabilność,
//-nie obciąża serwera bazodanowego.