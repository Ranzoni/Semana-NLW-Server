import knex from 'knex';

export async function up(knex: knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name', 25).notNullable();
        table.string('lastname', 100).notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('avatar').notNullable();
        table.string('whatsapp', 20).notNullable();
        table.string('bio').nullable();
    });
}

export async function down(knex: knex) {
    return knex.schema.dropTable('users');
}