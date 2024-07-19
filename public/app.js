const API_URL = 'https://apsona-keep-notes.onrender.com/api';
let authToken = null;

document.getElementById('regBtn').addEventListener('click', () => {
  document.getElementById('lg').style.display = 'none';
  document.getElementById('reg').style.display = 'block';
})

document.getElementById('reglogin').addEventListener('click', () => {
  document.getElementById('lg').style.display = 'block';
  document.getElementById('reg').style.display = 'none';
})

document.getElementById('login').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (response.ok) {
    const data = await response.json();
    authToken = data.token;
    document.getElementById('auth').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    loadNotes();
  } else {
    alert('Login failed');
  }
});

document.getElementById('register').addEventListener('click', async () => {
  const username = document.getElementById('regusername').value;
  const password = document.getElementById('regpassword').value;
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (response.ok) {
    alert('User registered successfully');
  } else {
    alert('Registration failed');
  }
});

document.getElementById('save-note').addEventListener('click', async () => {
  const content = document.getElementById('note-content').value;
  const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim());
  const color = document.getElementById('note-color').value;
  const dueDate = document.getElementById('note-dueDate').value;
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    },
    body: JSON.stringify({ content, tags, color, dueDate })
  });
  if (response.ok) {
    loadNotes();
    document.getElementById('note-form').reset();
    document.getElementById('note-form').style.display = 'none';
  } else {
    alert('Failed to save note');
  }
});

document.getElementById('view-archived').addEventListener('click', () => {
  loadNotes(true);
});

document.getElementById('view-reminders').addEventListener('click', () => {
  loadReminders();
});

document.getElementById('search').addEventListener('input', () => {
  const query = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.note').forEach(note => {
    const content = note.textContent.toLowerCase();
    if (content.includes(query)) {
      note.style.display = 'block';
    } else {
      note.style.display = 'none';
    }
  });
});

async function loadNotes(archived = false) {
  const endpoint = archived ? '/notes/archived' : '/notes';
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': authToken }
  });
  const notes = await response.json();
  displayNotes(notes);
}

async function loadReminders() {
  const response = await fetch(`${API_URL}/notes/reminders`, {
    headers: { 'Authorization': authToken }
  });
  const notes = await response.json();
  displayNotes(notes);
}

function displayNotes(notes) {
  const notesContainer = document.getElementById('notes');
  notesContainer.innerHTML = '';
  notes.forEach(note => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.style.backgroundColor = note.color;
    noteElement.textContent = note.content;
    notesContainer.appendChild(noteElement);
  });
}
