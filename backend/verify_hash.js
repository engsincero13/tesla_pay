const bcrypt = require('bcryptjs');

const hash = '$2b$10$5kea.Rt5yuCgNBzH8lEgRu9dvCjPcZMWYrmVl3plaW/WKYaqF65KO';

const passwordsToCheck = [
    '123456',
    'password',
    'admin',
    'root',
    'test',
    'teslapay',
    'dev',
    '12345678',
    '123456789',
    'qwerty',
    'admin123',
    'user',
    'guest',
    'demo',
    'changeme',
    'secret',
    // Names from seed data
    'giba',
    'giba123',
    'mauricio',
    'mauricio123',
    'maeli',
    'maeli123',
    'fabio',
    'joao',
    'abner',
    'pablo',
    'geovany',
    'emanuelle',
    'gabriel',
    'adson',
    'fernando',
    'vitor',
    'tesla',
    'tesla123',
    'treinamentos',
    'tesla_pay',
    'teslapay123',
    // Combinations
    'Giba',
    'Mauricio',
    'Maeli',
    'Tesla',
    'TeslaPay'
];

async function checkPasswords() {
    console.log(`Checking hash: ${hash}`);
    for (const pass of passwordsToCheck) {
        const match = await bcrypt.compare(pass, hash);
        if (match) {
            console.log(`FOUND! Password is: ${pass}`);
            return;
        }
    }
    console.log('Password not found in expanded list.');
}

checkPasswords();
