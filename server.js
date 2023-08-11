// server.js
const express = require('express');
const { Kafka } = require('kafkajs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); 

// Inisialisasi Kafka producer
const kafka = new Kafka({
  clientId: 'my-kafka-app',
  brokers: ['localhost:9092'] // Ganti dengan alamat broker Kafka Anda
});

const producer = kafka.producer();

// Inisialisasi Kafka consumer
const consumer = kafka.consumer({ groupId: 'test-group' });

// Endpoint untuk mengirim pesan ke Kafka
app.post('/send-message', async (req, res) => {

  const { message, user } = req.body;
  console.log(user)

  try {
    await producer.connect();
    // Mengirim pesan ke topik 'my-topic'
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: message }]
    });

    console.log('Pesan berhasil dikirim ke Kafka:', message);
    res.send('Pesan berhasil dikirim ke Kafka.');
  } catch (error) {
    console.error('Error saat mengirim pesan ke Kafka:', error);
    res.status(500).send('Terjadi kesalahan saat mengirim pesan ke Kafka.');
  }
});

// Mulai consumer dan proses pesan yang diterima
const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
      // Lakukan pemrosesan pesan di sini sesuai kebutuhan Anda
    },
  });
};

runConsumer().catch((error) => {
  console.error('Terjadi kesalahan saat menjalankan consumer:', error);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
