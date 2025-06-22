import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [timelines, setTimelines] = useState([]);

  useEffect(() => {
    const fetchTimelines = async () => {
      const q = query(
        collection(db, "timelines"),
        where("owner", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      setTimelines(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchTimelines();
  }, []);

  return (
    <div>
      <h2>Your Timelines</h2>
      <Link to="/timeline/create">
        <button>Create New Timeline</button>
      </Link>
      <ul>
        {timelines.map((tl) => (
          <li key={tl.id}>
            <Link to={`/timeline/${tl.id}`}>{tl.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
