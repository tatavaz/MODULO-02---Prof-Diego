import { openDatabase } from "../database.js";

export const checkinActivities = async (request, response) => {
  const { label } = request.body;
  const db = await openDatabase();

  const vehicle = await db.get(`
    SELECT * FROM vehicles WHERE label = ? 
  `, [label]);

  if(vehicle) {
    const checkinAt = (new Date()).getTime();
    const data = await db.run(`
    INSERT INTO activities (vehicles_id, checkin_at) 
    VALUES (?, ?)
  `, [vehicle.id, checkinAt]);

  db.close();
  response.send({
    vehicles_id: vehicle.id,
    checkin_at: checkinAt, 
    message: `O veículo com a placa [${vehicle.label}] entrou no estacionamento`
  });
  return;
  }
  db.close();
  response.status(400).send({
    message: `O veículo com a placa [${label}] não está cadastrado`
  })
};

export const checkoutActivities = async (request, response) => {
  const { label, price } = request.body;
  const db = await openDatabase();

  const vehicle = await db.get(`
    SELECT * FROM vehicles WHERE label = ? 
  `, [label]);

  if(vehicle) {
    const activityOpen = await db.get(`
    SELECT * 
      FROM activities 
    WHERE vehicles_id = ? 
      AND checkout_at is NULL 
  `, [vehicle.id]);

    if(activityOpen) {
      const checkoutAt = (new Date()).getTime();
      const data = await db.run(`
        UPDATE activities
          SET checkout_at = ?,
              price = ?
        WHERE id = ?
      `, [checkoutAt, price, activityOpen.id]);

      db.close();
      response.send({
        vehicles_id: vehicle.id,
        checkout_at: checkoutAt, 
        price: price,
        message: `O veículo com a placa [${vehicle.label}] saiu do estacionamento`
      });
      return;
    }

    db.close();
    response.status(400).send({
      message: `O veículo com a placa [${label}] não realizou nenhum check-in`
    })
    return;
  }
  db.close();
  response.status(400).send({
    message: `O veículo com a placa [${label}] não está cadastrado`
  })
};

export const removeActivities = async (request, response) => {
  const { id } = request.params;
  const db = await openDatabase();
  const data = await db.run(`
    DELETE FROM activities
      WHERE id = ? 
  `, [id]);
  db.close();
  response.send({
    id,
    message: `Atividade [${id}] removida com sucesso.`
  });
};

export const listActivities = async (request, response) => {
  const db = await openDatabase();
  const activities = await db.all(`
    SELECT * FROM activities
  `);
  db.close();
  response.send(activities);
};