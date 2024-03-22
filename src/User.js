import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchUser } from "./utils/api";

export default function User() {
  const { token } = useSelector(({ auth }) => auth);
  const { displayName } = useParams();
  const [user, setUser] = useState(null);


  useEffect(() => {
    if (!displayName)
      return;

    fetchUser(token, displayName).then((x) => {
      setUser(x.displayName);
    });
  }, [displayName]);

  return user && <h1>{user}</h1>
}