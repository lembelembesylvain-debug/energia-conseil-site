/**
 * Coffre navigateur (IndexedDB) — hors public/, hors src/assets/, hors Git.
 * Les octets ne sont jamais sérialisés dans localStorage ni dans un JSON public.
 */

const DB_NAME = "energia-crm-coffre-v1";
const STORE = "documents";

function ouvrirDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB indisponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function lienSecuriseCoffre(documentId) {
  return `idb://${DB_NAME}/${STORE}/${documentId}`;
}

export async function enregistrerBlobCoffre(documentId, blob) {
  const db = await ouvrirDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, documentId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return lienSecuriseCoffre(documentId);
}

export async function lireBlobCoffre(documentId) {
  const db = await ouvrirDb();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(documentId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}
