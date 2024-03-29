const mssql = require('mssql')
const bcrypt = require('bcrypt')

var database_user = {
    user: 'foo',
    password: 'foo',
    server: 'localhost',
    database: 'Proj',
    options: {
        trustServerCertificate: true
    }
}

async function update_productname(id, name) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    request.input('id', id)
    request.input('name', name)
    await request.query('UPDATE PRODUCTDATA SET NAME=@name WHERE ID=@id')
    await user_pool.close()
}

async function update_productprice(id, price) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request( user_pool )
    request.input('id', id)
    request.input('price', price)
    await request.query('UPDATE PRODUCTDATA SET PRICE=@price WHERE ID=@id')
    await user_pool.close()
}

async function get_userdata(column, user_desc, data = '*') {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    var result = await request.query(`SELECT ${data} FROM USERDATA WHERE ${column}='${user_desc}'`)
    await user_pool.close()
    data = []
    result.recordset.forEach(r => {
        data.push(r)
    })
    return data
}

async function get_user_cart(user_id) {
    try {
        const user_pool = new mssql.ConnectionPool(database_user)
        await user_pool.connect()

        const request = new mssql.Request(user_pool)
        const query = 'SELECT * FROM CART WHERE USER_ID = @user_id'

        request.input('user_id', mssql.Int, user_id);
        const result = await request.query(query)

        await user_pool.close()

        const data = result.recordset
        return data
    } catch (error) {
        console.error('Error:', error.message)
    }
}

async function add_to_user_cart(user_id, product_id) {
    try {
        const user_pool = new mssql.ConnectionPool(database_user)
        await user_pool.connect()

        const request = new mssql.Request(user_pool)
        const query = `INSERT INTO CART (USER_ID, PRODUCT_ID) VALUES (@user_id, @product_id)`

        request.input('user_id', mssql.Int, user_id)
        request.input('product_id', mssql.Int, product_id)

        await request.query(query)
        await user_pool.close()
    } catch (error) {
        console.error('Error:', error.message)
    }
}

async function delete_from_user_cart(user_id, product_id) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    request.input('user_id', user_id)
    request.input('product_id', product_id)
    await request.query('DELETE TOP(1) FROM CART WHERE PRODUCT_ID=@product_id AND USER_ID=@user_id')
    user_pool.close()
}

async function delete_data(table, id) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()

    var cartRequest = new mssql.Request(user_pool)
    await cartRequest.query(`DELETE FROM CART WHERE PRODUCT_ID =${id}`)

    var request = new mssql.Request(user_pool)
    await request.query(`DELETE FROM ${table} WHERE ID=${id}`)
    await user_pool.close()
}

async function get_productdata(column, product_desc, data = '*') {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    var result = await request.query(`SELECT ${data} FROM PRODUCTDATA WHERE ${column}='${product_desc}'`)
    await user_pool.close()
    data = []
    result.recordset.forEach(r => {
        data.push(r)
    })
    return data
}

async function get_products(searchTerm) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    request.input('searchTerm', searchTerm)
    var result = await request.query('SELECT * FROM PRODUCTDATA WHERE NAME LIKE @searchTerm')
    await user_pool.close()
    data = []
    result.recordset.forEach(r => {
        data.push(r)
    })
    return data
}

async function get_orders() {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    var result = await request.query('SELECT * FROM [ORDER]')
    await user_pool.close()
    data = []
    result.recordset.forEach(r => {
        data.push(r)
    })
    return data
}

async function get_users() {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    var result = await request.query('SELECT * FROM USERDATA')
    await user_pool.close()
    data = []
    result.recordset.forEach(r => {
        data.push(r)
    })
    return data
}

async function set_productdata(product) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    await request.query(`INSERT INTO PRODUCTDATA(NAME, PRICE) VALUES('${product.name}', ${product.price})`)
    await user_pool.close()
}

async function set_userdata(user) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    await request.query(`INSERT INTO USERDATA(NAME, PSSWRD) VALUES('${user.name}', '${user.psswrd}')`)
    await user_pool.close()
}

async function save_user_info(username, password) {
    var hash_password = await bcrypt.hash(password, 12)
    await set_userdata({ name: username, psswrd: hash_password })
}

async function check_if_id_exists(id) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    request.input('id', id)
    var result = await request.query('SELECT COUNT(*) AS res FROM PRODUCTDATA WHERE ID=@id')
    await user_pool.close()
    return result.recordset[0].res == 1
}

async function get_order_id() {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    var result = await request.query('SELECT NEXT VALUE FOR order_id AS res')
    await user_pool.close()
    return result.recordset[0].res
}


async function add_order(id, user_id, cart) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    const query = 'SELECT * FROM CART WHERE USER_ID = @user_id'
    request.input('user_id', mssql.Int, user_id);
    const result = await request.query(query)
    for (r of result.recordset) {
        await request.query(`INSERT INTO [ORDER] (ID, USER_ID, PRODUCT_ID, COMPLETED) VALUES (${id},${user_id},${r['PRODUCT_ID']},0)`)
    }
    await user_pool.close()
}


async function update_order_status(order_id){
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    const query = 'UPDATE [ORDER] SET COMPLETED=1 WHERE ID = @order_id'
    request.input('order_id', mssql.Int, order_id);
    await request.query(query)
    await user_pool.close()
}


async function delete_cart(user_id) {
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    await request.query(`DELETE FROM CART WHERE USER_ID=${user_id}`)
}

async function delete_order(id){
    var user_pool = new mssql.ConnectionPool(database_user)
    await user_pool.connect()
    var request = new mssql.Request(user_pool)
    await request.query(`DELETE FROM ORDER WHERE ID=${id}`)   
}

module.exports = {
    get_productdata: get_productdata,
    get_userdata: get_userdata,
    set_productdata: set_productdata,
    set_userdata: set_userdata,
    get_products: get_products,
    delete_data: delete_data,
    add_to_user_cart: add_to_user_cart,
    get_user_cart: get_user_cart,
    save_user_info: save_user_info,
    update_productname: update_productname,
    update_productprice: update_productprice,
    check_if_id_exists: check_if_id_exists,
    delete_from_user_cart: delete_from_user_cart,
    get_order_id: get_order_id,
    add_order: add_order,
    delete_cart: delete_cart,
    get_users: get_users,
    get_orders: get_orders,
    update_order_status: update_order_status,
    delete_order: delete_order,
};


