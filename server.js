const jsonServer = require('json-server');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsPromises = fs.promises;
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();


const readJson = async (file) => {
  const rawData = await fsPromises.readFile(file);
  return JSON.parse(rawData);
}

const writeJson = async (content, file) => 
  await fsPromises.writeFile(file, content);

const getDb = async() => readJson('db.json');
const getUsers = async() => (await getDb()).users;
const getTokens = async() => readJson('auth.json');
const writeTokens = async(content) => writeJson(JSON.stringify(content), 'auth.json');
const findUserByUsername = (usernameToFind, users = []) => 
  users.find(({username}) => username === usernameToFind);

server.use(middlewares)
server.use(jsonServer.bodyParser)
server.use(async(req, res, next) => {
  if(req.url === '/users' && req.method === 'POST') {
    if (!req.body.username || !req.body.password) res.sendStatus(400);
    req.body.password = await bcrypt.hash(req.body.password, 10);
    next();
  } else if(req.url === '/sign-in' && req.method === 'POST') {
    if (!req.body.username || !req.body.password) return res.sendStatus(400);

    const users = await getUsers();
    const user = findUserByUsername(req.body.username, users);

    if (!user) return res.sendStatus(403); 

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    if(!isPasswordCorrect) return res.sendStatus(400);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      'SECRET_FOR_TESTING',
      { expiresIn: '30d' }
    );

    const tokens = await getTokens();
    const newTokens = [ ...tokens, token];

    await writeTokens(newTokens);

    return res.json({ ...user, token })
  } else {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const tokens = await getTokens();
    if (!tokens.includes(token)) return res.sendStatus(401);

    next();
  }
});

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
});
