import crypto from 'node:crypto';

export default function uuid(){
    return crypto.randomUUID();
};