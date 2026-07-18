import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = "0.0.0.0";

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Backend запущен на http://${HOST}:${PORT}`);
});
