const { Role } = require('./models');

const checkRoles = async () => {
  const roles = await Role.findAll();
  console.log(roles.map(r => r.toJSON()));
};

checkRoles();
