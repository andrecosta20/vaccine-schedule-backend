const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const appointmentRoutes = require('../routes/appointments');

const app = express();
app.use(bodyParser.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment Routes', () => {
  it('should create a new appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        name: 'John Doe',
        birthDate: '1990-01-01',
        appointmentDate: '2024-07-20',
        appointmentTime: '10:00'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Appointment created successfully');
    expect(res.body.appointment).toHaveProperty('id');
  });

  it('should get all appointments', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('groupedAppointments');
  });

  it('should delete an appointment', async () => {
    const res = await request(app)
      .delete('/api/appointments/1'); 
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Appointment deleted successfully');
  });

  it('should update the status of an appointment', async () => {
    const res = await request(app)
      .put('/api/appointments/1') 
      .send({ completed: true });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Appointment status updated successfully');
  });
});
