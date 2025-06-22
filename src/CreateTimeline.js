import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function CreateTimeline() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "timelines"), {
      title,
      description,
      owner: auth.currentUser.uid,
      createdAt: Timestamp.now(),
    });
    navigate(`/timeline/${docRef.id}`);
  };

  return (
    <div>
      <h2>Create Timeline</h2>
      <form onSubmit={handleCreate}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Timeline Title"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
