import { Request, Response } from 'express';
import User from '../entities/user.model';
import db from '../database/connection';
import ReturnValidation from '../models/return-validation.model';

export default class UsersController {
    public async index(request: Request, response: Response) {
        try {
            const id = request.params.id as string;
            const user = await db('users')
                .where('users.id', '=', id)
                .first() as User;
            return response.json(user);
        } catch (err) {
            return response.status(400).send({ message: err.message });
        }
    }

    public async login(request: Request, response: Response) {
        try {
            const email = request.query.email as string;
            const password = request.query.password as string;
            const user = await db('users')
                .where('users.email', '=', email)
                .first() as User;
            if (!user)
                response.status(404).send();
            const match = await this.comparePassword(password, user.password);
            if (!match)
                response.json(this.returnValidationObject("Senha inválida"));
            return response.json({ token: this.generateToken(user.id), user });
        } catch (err) {
            return response.status(400).send({ message: err.message });
        }
    }

    public async create(request: Request, response: Response) {
        try {
            const user = request.body as User;
            var validation = await this.validateInsert(user);
            if (!!validation)
                return response.json(this.returnValidationObject(validation));

            const trx = await db.transaction();
            try {
                user.password = await this.encryptPassword(user.password);
                await trx('users').insert<User>(user);
                await trx.commit();
                return response.status(201).send();
            } catch (err) {
                await trx.rollback();
                throw err;
            }
        } catch (err) {
            return response.status(400).json({ message: err.message });
        }
    }

    public async update(request: Request, response: Response) {
        try {
            const idUser = request.params.id as string;
            const newUser = request.body as User;
            newUser.id = idUser;

            var validation = await this.validateUpdate(newUser);
            if (!!validation)
                return response.json(this.returnValidationObject(validation));
            
            const trx = await db.transaction();
            try {
                newUser.password = await this.encryptPassword(newUser.password);
                await trx('users').where('users.id', '=', idUser).update(newUser);
                const user = await trx('users').where('users.id', '=', idUser).first() as User;
                await trx.commit();
                return response.json(user);
            } catch (err) {
                await trx.rollback();
                throw err;
            }
        } catch (err) {
            return response.status(400).json({ message: err.message });        
        }
    }

    private returnValidationObject(message: string): ReturnValidation | undefined {
        if (!!message)
            return new ReturnValidation(message);
        return undefined;
    }

    private async validateUpdate(user: User): Promise<string> {
        const { total } = (
            await db('users')
                .where('users.id', '<>', user.id)
                .where('users.email', '=', user.email)
                .count('* as total'))[0];
        if (!!total) 
            return "Já existe um usuário cadastrado com este e-mail";
        
        return "";
    }

    private async validateInsert(user: User): Promise<string> {
        const { total } = (
            await db('users')
                .where('users.email', '=', user.email)
                .count('* as total'))[0];
        if (!!total) 
            return "Já existe um usuário cadastrado com este e-mail";
        
        return "";
    }

    private async encryptPassword(pass: string): Promise<string> {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const hash = await bcrypt.hash(pass, saltRounds);
        return hash;
    }

    private async comparePassword(pass: string, passCompare: string): Promise<boolean> {
        const bcrypt = require('bcrypt');
        const match = await bcrypt.compare(pass, passCompare);
        return match;
    }

    private generateToken(id: string): string {
        const jwt = require("jsonwebtoken");
        return jwt.sign({ id: id }, "secret", {
            expiresIn: 86400
        });
    }
}