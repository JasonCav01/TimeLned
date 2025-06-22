import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import QRCode from "qrcode.react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ViewTimeline() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      const docRef = doc(db, "timelines", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTimeline({ id: docSnap.id, ...docSnap.data() });
      }
    };

    const fetchPhotos = async () => {
      const q = query(collection(db, `timelines/${id}/photos`));
      const snapshot = await getDocs(q);
      const sorted = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setPhotos(sorted);
    };

    fetchTimeline();
    fetchPhotos();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const storageRef = ref(storage, `timelines/${id}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, `timelines/${id}/photos`), {
      url: downloadURL,
      timestamp: new Date().getTime(),
      uploader: auth.currentUser.uid,
    });

    setFile(null);
    window.location.reload(); // quick refresh to update photo list
  };

  if (!timeline) return <p>Loading...</p>;

  return (
    <div>
      <h2>{timeline.title}</h2>
      <div style={{ margin: "20px 0" }}>
        <h4>Share This Timeline</h4>
        <QRCode value={window.location.href} />
      </div>
      {timeline.owner === auth.currentUser?.uid && (
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Upload Photo</button>
        </form>
      )}
      <div>
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.url}
            alt="Uploaded"
            style={{ width: "200px", margin: "10px" }}
          />
        ))}
      </div>
    </div>
  );
}
