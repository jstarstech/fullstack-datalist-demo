import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  server: {
    port: process.env.PORT || 3000,
  },
};

const app = express();
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const routes = express.Router();

if (process.env.NODE_ENV === "development") {
  routes.get("/", (req, res) => {
    res.render("index");
  });
} else {
  app.use("/", express.static(`./static`));
}

const items = Array.from({ length: 1_000_000 }, (_, i) => ({
  id: i + 1,
  value: `Item ${i + 1}`,
  order: i + 1,
}));

const clientStates = new Map();

function getClientState(clientId) {
  if (!clientStates.has(clientId)) {
    clientStates.set(clientId, { selected: new Set() });
  }
  return clientStates.get(clientId);
}

app.get("/api/items", (req, res) => {
  const { offset = 0, limit = 20, search = "" } = req.query;

  let _items = items;
  if (search) {
    const s = search.toLowerCase();
    _items = _items.filter((item) => item.value.toLowerCase().includes(s));
  }

  // Sort items by their order property
  _items = _items.slice().sort((a, b) => a.order - b.order);

  const paginated = _items.slice(+offset, +offset + +limit);

  res.json({ items: paginated });
});

app.post("/api/select", (req, res) => {
  const { clientId, ids, selected } = req.body;
  const state = getClientState(clientId);

  ids.forEach((id) => {
    if (selected) {
      state.selected.add(id);
    } else {
      state.selected.delete(id);
    }
  });

  res.json({ ok: true });
});

app.post("/api/order", (req, res) => {
  const { order } = req.body;

  const idToItem = new Map(items.map((item) => [item.id, item]));

  const originalOrders = order
    .map((id) => idToItem.get(id)?.order)
    .filter((o) => o !== undefined);

  const sortedOrders = [...originalOrders].sort((a, b) => a - b);

  order.forEach((id, idx) => {
    const item = idToItem.get(id);
    if (item) {
      item.order = sortedOrders[idx];
    }
  });

  res.json({ ok: true });
});

app.get("/api/state", (req, res) => {
  const { clientId } = req.query;
  const state = getClientState(clientId);

  res.json({ selected: Array.from(state.selected) });
});

routes.use((_req, res) => {
  return res.status(404).send({
    success: false,
    message: "Resource not found.",
  });
});

app.use("/", routes);

app.listen(config.server.port);

console.log("Server started on port: " + config.server.port);
