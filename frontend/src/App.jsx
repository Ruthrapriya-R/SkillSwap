import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [profiles, setProfiles] = useState([])
  const [skills, setSkills] = useState([]) 
  const [searchTerm, setSearchTerm] = useState("")
  const [connectedUsers, setConnectedUsers] = useState({})
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    skills_offered: [], 
    skills_wanted: []
  })

  const myUsername = "Ruth"; 

  
  const fetchData = () => {
    axios.get('http://127.0.0.1:8000/api/profiles/')
      .then(response => setProfiles(response.data))
      .catch(error => console.error("Error:", error))
  }

  const handleDelete = (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      axios.delete(`http://127.0.0.1:8000/api/profile/${username}/`)
        .then(() => {
          alert("User Deleted! 🗑️");
          fetchData(); 
        })
        .catch(error => {
          console.error("Delete Failed Details:", error); 
          alert("Error deleting user! Check Console.");
        });
    }
  }

  const handleConnect = (profileId, receiverName) => {
    console.log(`Connecting: ${myUsername} -> ${receiverName}`);

    axios.post('http://127.0.0.1:8000/api/connect/', {
        sender: myUsername,
        receiver: receiverName
    })
    .then(response => {
        setConnectedUsers(prev => ({ ...prev, [profileId]: true }));
        alert(response.data.message);
    })
    .catch(error => {
        console.error("Connection Error:", error);
        alert(`Error! Does user '${myUsername}' exist?`);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    axios.post('http://127.0.0.1:8000/api/profiles/', formData)
      .then(() => { 
        alert("Welcome to the community! 🎉");
        setShowForm(false); 
        fetchData(); 
        setFormData({ username: "", bio: "", location: "", skills_offered: [], skills_wanted: [] })
      })
      .catch(() => alert("Error: Username might be taken!")); 
  }

  const handleCheckbox = (type, id) => {
    const list = formData[type];
    if (list.includes(id)) {
      setFormData({ ...formData, [type]: list.filter(item => item !== id) })
    } else {
      setFormData({ ...formData, [type]: [...list, id] })
    }
  }

  useEffect(() => {
    fetchData();
    axios.get('http://127.0.0.1:8000/api/skills/')
      .then(res => setSkills(res.data))
      .catch(err => console.error(err))
  }, [])

  const filteredProfiles = profiles.filter(profile => {
    if (profile.user.username === myUsername) return false;

    if (searchTerm === "") return true;
    const lowerSearch = searchTerm.toLowerCase();
    
    const offers = profile.skills_offered || [];
    const wants = profile.skills_wanted || [];
    const loc = profile.location || "";
    
    return offers.some(s => s.name.toLowerCase().includes(lowerSearch)) ||
           wants.some(s => s.name.toLowerCase().includes(lowerSearch)) ||
           loc.toLowerCase().includes(lowerSearch);
  });

  return (
    <div className="container">
      <header className="navbar">
        <div className="logo">⚡ SkillSwap</div>
        
        <input 
          type="text" 
          placeholder="🔍 Find skill (e.g., Python)..." 
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button className="btn-login" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close x" : "+ Join Community"}
        </button>
      </header>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <h2>Create Your Profile</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <input type="text" placeholder="Location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            <textarea placeholder="Bio..." required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
            
            <div className="checkbox-group">
              <label>I can Teach:</label>
              <div className="options">{skills.map(s => <span key={s.id} onClick={() => handleCheckbox('skills_offered', s.id)} className={formData.skills_offered.includes(s.id) ? "selected" : ""}>{s.name}</span>)}</div>
            </div>

            <div className="checkbox-group">
              <label>I want to Learn:</label>
              <div className="options">{skills.map(s => <span key={s.id} onClick={() => handleCheckbox('skills_wanted', s.id)} className={formData.skills_wanted.includes(s.id) ? "selected" : ""}>{s.name}</span>)}</div>
            </div>

            <button type="submit" className="btn-submit">Create Profile 🚀</button>
          </form>
        </div>
      )}

      {/* CARDS */}
      <div className="card-grid">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="profile-card">
            
            {/* HEADER WITH TRASH BUTTON */}
            <div className="card-header">
              <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                 <h3>{profile.user.username}</h3>
                 
                 {/* TRASH BUTTON 🗑️ */}
                 <button 
                   onClick={() => handleDelete(profile.user.username)}
                   style={{ background: 'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem' }}
                   title="Delete User"
                 >
                   🗑️
                 </button>
              </div>
            </div>
            
            <div style={{marginBottom:'15px'}}>
               <span className="location">📍 {profile.location}</span>
            </div>
            
            <p className="bio">"{profile.bio}"</p>

            <div className="skills-section">
              <div className="skill-group"><small>OFFERS:</small><div className="tags">{profile.skills_offered.map(s => <span key={s.id} className="tag offer">{s.name}</span>)}</div></div>
              <div className="skill-group"><small>WANTS:</small><div className="tags">{profile.skills_wanted.map(s => <span key={s.id} className="tag want">{s.name}</span>)}</div></div>
            </div>
            
            <button 
              className="btn-connect"
              style={{ 
                backgroundColor: connectedUsers[profile.id] ? '#10b981' : '',
                cursor: connectedUsers[profile.id] ? 'default' : 'pointer'
              }}
              onClick={() => handleConnect(profile.id, profile.user.username)}
              disabled={connectedUsers[profile.id]}
            >
              {connectedUsers[profile.id] ? "Request Sent! ✅" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App