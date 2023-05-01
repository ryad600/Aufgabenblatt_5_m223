const USER_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    balance INT NOT NULL,
    pin INT NOT NULL,
    PRIMARY KEY (id)
);
`

export { USER_TABLE }
