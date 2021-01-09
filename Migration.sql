drop database if exists productDB;
create database productDB;
use productDB;
SET SQL_SAFE_UPDATES = 0;
create table cart(
    id int not null auto_increment primary key,
    productname varchar(20) not null,
    quantity int not null,
    sessionid VARCHAR (36) not NULL 
);