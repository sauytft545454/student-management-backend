const mysql=require('mysql2');
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Sukhi@4525',
    database:'student_management_advanced'

});
module.exports=db;