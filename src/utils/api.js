import React from 'react';
import axios from "axios";


export async function loginWithToken(token) {
  const user = await fetch('/api/authenticate', {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
      'Authentication': token
    }
  }).then(res => res.json())
    .catch(e => {
      console.log(e);
      throw Error(e)
    });

  localStorage.setItem('token', user.token);

  return user;
}

export async function login({ email, password }) {
  const { user, token } = await fetch('/api/login', {
    'method': 'POST',
    'body': JSON.stringify({ email, password }),
    'headers': {
      'Content-Type': 'application/json'
    }

  }).then((res) => res.json());
  localStorage.setItem('token', token);
  return { ...user, token };
}

export async function register({ email, password, displayName }) {
  try {
    const user = await fetch('/api/register', {
      'method': 'POST',
      'body': JSON.stringify({ email, password, displayName }),
      'headers': {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json());
    return user;
  } catch (e) {
    throw Error(e);
  }
}

export async function saveGameImage(token, image, gameId) {
  const url = `/api/upload/${gameId}`;
  const config = { headers: { 'Authorization': token } };
  try {
    const result = await axios.post(url, { image }, config);
    console.log(result);
    return result;
  } catch (e) {
    throw Error(e);
  }
}

export async function fetchCompletedGames(token) {
  try {
    const games = await fetch('/api/games', {
      method: 'GET',
      headers: { 'Authorization': token }
    }).then((res) => res.json());
    return games;
  } catch (e) {
    throw Error(e);
  }
}

export async function fetchUser(token, displayName) {
  try {
    return fetch(`/api/user-profile/${displayName}`, {
      method: 'GET',
      headers: { 'Authorization': token }
    }).then((res) => res.json());
  } catch (e) {
    throw Error(e);
  }
}