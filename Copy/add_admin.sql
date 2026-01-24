INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password, 
    role, 
    phone, 
    wilaya
) VALUES (
    'Bilal', 
    'Brahami', 
    'bilalbrahami026@gmail.com', 
    'ABCd1234', -- Note: Depending on your backend, you may need to register this via the UI or hash this password (e.g. bcrypt)
    'admin', 
    '0500000000', 
    'Alger'
);
