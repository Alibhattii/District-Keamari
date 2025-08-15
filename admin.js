(function(){
  const AUTH_KEY = 'dkpc_auth';
  const LOGIN = {user:'ali ', pass:'alialwaysright'};

  window.login = function(){
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value.trim();
    const status = document.getElementById('loginStatus');
    
    if(!u || !p) {
      status.textContent = 'Please enter both username and password.';
      status.style.color = '#ef4444';
      return;
    }
    
    if(u === LOGIN.user && p === LOGIN.pass){
      localStorage.setItem(AUTH_KEY, JSON.stringify({at: Date.now(), user:u}));
      status.textContent = '✅ Login successful! Loading dashboard...';
      status.style.color = '#10b981';
      setTimeout(() => showDashboard(), 1000);
    } else {
      status.textContent = '❌ Invalid credentials. Please try again.';
      status.style.color = '#ef4444';
    }
  };

  window.logout = function(){
    localStorage.removeItem(AUTH_KEY);
    location.reload();
  }

  function isAuthed(){
    try{
      const a = JSON.parse(localStorage.getItem(AUTH_KEY)||'null');
      return a && a.user === LOGIN.user;
    }catch(e){return false;}
  }

  function showDashboard(){
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateDashboardStats();
    showRecentMessages();
    updateActivityLog();
  }

  function updateDashboardStats(){
    const messages = JSON.parse(localStorage.getItem('dkpc_messages')||'[]');
    const videos = JSON.parse(localStorage.getItem('dkpc_videos')||'[]');
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Count recent messages (last 24 hours)
    const recentMessages = messages.filter(m => m.time > oneDayAgo).length;
    
    // Get last login time
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY)||'null');
    const lastLogin = auth ? new Date(auth.at).toLocaleDateString() : '-';
    
    document.getElementById('messageCount').textContent = messages.length;
    document.getElementById('videoCount').textContent = videos.length;
    document.getElementById('recentMessages').textContent = recentMessages;
    document.getElementById('lastLogin').textContent = lastLogin;
  }

  function showRecentMessages(){
    const box = document.getElementById('messagesBox');
    const msgs = JSON.parse(localStorage.getItem('dkpc_messages')||'[]').sort((a,b)=>b.time - a.time).slice(0, 5);
    
    if(!msgs.length){ 
      box.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--muted);"><p>📭 No messages yet</p><p style="font-size: 0.875rem;">Messages from the contact form will appear here</p></div>'; 
      return; 
    }
    
    box.innerHTML = msgs.map(m => `
      <div class="message" style="border-left: 4px solid var(--accent); padding-left: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: var(--text);">${m.name}</strong>
          <span style="font-size: 0.875rem; color: var(--muted);">${new Date(m.time).toLocaleDateString()}</span>
        </div>
        <div style="color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem;">${m.email}</div>
        <div style="line-height: 1.5;">${m.message.replace(/[<>&]/g, c=>({ '<':'&lt;', '>':'&gt;', '&':'&amp;' }[c]))}</div>
      </div>
    `).join('');
  }

  // Enhanced Messages display
  window.showMessages = function(){
    const box = document.getElementById('messagesBox');
    const msgs = JSON.parse(localStorage.getItem('dkpc_messages')||'[]').sort((a,b)=>b.time - a.time);
    
    if(!msgs.length){ 
      box.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--muted);"><p>📭 No messages yet</p></div>'; 
      return; 
    }
    
    box.innerHTML = msgs.map(m => `
      <div class="message" style="border-left: 4px solid var(--accent); padding-left: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: var(--text);">${m.name}</strong>
          <span style="font-size: 0.875rem; color: var(--muted);">${new Date(m.time).toLocaleString()}</span>
        </div>
        <div style="color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem;">
          📧 ${m.email} ${m.phone ? `| 📞 ${m.phone}` : ''} ${m.subject ? `| 📋 ${m.subject}` : ''}
        </div>
        <div style="line-height: 1.5;">${m.message.replace(/[<>&]/g, c=>({ '<':'&lt;', '>':'&gt;', '&':'&amp;' }[c]))}</div>
      </div>
    `).join('');
  }

  // Enhanced YouTube video handling
  function parseYouTubeId(url){
    try{
      const u = new URL(url);
      if(u.hostname.includes('youtu.be')) return u.pathname.slice(1);
      if(u.hostname.includes('youtube.com')){
        if(u.searchParams.get('v')) return u.searchParams.get('v');
        const m = u.pathname.match(/\/embed\/([\w-]{6,})/); if(m) return m[1];
        const m2 = u.pathname.match(/\/watch\?v=([\w-]{6,})/); if(m2) return m2[1];
      }
    }catch(e){}
    return null;
  }

  function getYouTubeThumbnail(videoId){
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  window.applyVideo = function(){
    const title = document.getElementById('vtitle').value.trim();
    const description = document.getElementById('vdesc').value.trim();
    const yt = document.getElementById('ytlink').value.trim();
    const fileInput = document.getElementById('vfile');
    const status = document.getElementById('videoStatus');

    if(!title) {
      status.textContent = '❌ Please enter a video title.';
      status.style.color = '#ef4444';
      status.style.background = 'rgba(239, 68, 68, 0.1)';
      return;
    }

    const save = (obj)=>{
      const list = JSON.parse(localStorage.getItem('dkpc_videos')||'[]');
      list.push(obj);
      localStorage.setItem('dkpc_videos', JSON.stringify(list));
      
      status.textContent = '✅ Video uploaded successfully! It will appear on the News page.';
      status.style.color = '#10b981';
      status.style.background = 'rgba(16, 185, 129, 0.1)';
      
      // Clear form
      document.getElementById('vtitle').value='';
      document.getElementById('vdesc').value='';
      document.getElementById('ytlink').value='';
      fileInput.value='';
      
      // Update stats
      updateDashboardStats();
      updateActivityLog();
      
      setTimeout(()=> {
        status.textContent = '';
        status.style.background = '';
      }, 5000);
    };

    if(yt){
      const id = parseYouTubeId(yt);
      if(!id){ 
        status.textContent = '❌ Please paste a valid YouTube link. Supported formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/';
        status.style.color = '#ef4444';
        status.style.background = 'rgba(239, 68, 68, 0.1)';
        return; 
      }
      
      const videoData = {
        type: 'youtube', 
        videoId: id, 
        title, 
        description, 
        created: Date.now(),
        thumbnail: getYouTubeThumbnail(id),
        originalUrl: yt
      };
      
      save(videoData);
      return;
    }

    const file = fileInput.files && fileInput.files[0];
    if(file){
      if(file.size > 40*1024*1024){ 
        status.textContent = '❌ File too large (max 40MB). Please use a smaller file or YouTube link.';
        status.style.color = '#ef4444';
        status.style.background = 'rgba(239, 68, 68, 0.1)';
        return; 
      }
      
      const reader = new FileReader();
      reader.onload = function(e){
        const videoData = {
          type: 'file', 
          src: e.target.result, 
          title, 
          description, 
          created: Date.now(),
          fileName: file.name,
          fileSize: file.size
        };
        save(videoData);
      };
      reader.readAsDataURL(file);
      return;
    }

    status.textContent = '❌ Please provide either a YouTube link or choose a video file.';
    status.style.color = '#ef4444';
    status.style.background = 'rgba(239, 68, 68, 0.1)';
  };

  function updateActivityLog(){
    const activityLog = document.getElementById('activityLog');
    const messages = JSON.parse(localStorage.getItem('dkpc_messages')||'[]');
    const videos = JSON.parse(localStorage.getItem('dkpc_videos')||'[]');
    
    const allActivities = [
      ...messages.map(m => ({...m, type: 'message'})),
      ...videos.map(v => ({...v, type: 'video'}))
    ].sort((a,b) => b.created - a.created).slice(0, 10);
    
    if(!allActivities.length) {
      activityLog.innerHTML = '<p style="text-align: center; color: var(--muted);">No recent activity</p>';
      return;
    }
    
    activityLog.innerHTML = allActivities.map(activity => {
      const date = new Date(activity.created || activity.time).toLocaleDateString();
      const time = new Date(activity.created || activity.time).toLocaleTimeString();
      
      if(activity.type === 'message') {
        return `
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(59,130,246,0.05); border-radius: var(--radius);">
            <div style="width: 40px; height: 40px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">💬</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--text);">New message from ${activity.name}</div>
              <div style="font-size: 0.875rem; color: var(--muted);">${date} at ${time}</div>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(16,185,129,0.05); border-radius: var(--radius);">
            <div style="width: 40px; height: 40px; background: var(--accent-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🎥</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--text);">Video uploaded: ${activity.title}</div>
              <div style="font-size: 0.875rem; color: var(--muted);">${date} at ${time}</div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // Video management for admin
  window.removeVideo = function(btn) {
    if (confirm('Are you sure you want to delete this video?')) {
      const videoId = btn.getAttribute('data-video-id');
      let videos = JSON.parse(localStorage.getItem('dkpc_videos')||'[]');
      videos = videos.filter(v => v.videoId !== videoId);
      localStorage.setItem('dkpc_videos', JSON.stringify(videos));
      btn.parentElement.remove();
      updateDashboardStats();
      updateActivityLog();
    }
  }

  window.removeAllVideos = function() {
    if (confirm('Are you sure you want to delete ALL videos? This action cannot be undone.')) {
      localStorage.removeItem('dkpc_videos');
      // Optionally update dashboard stats and activity log
      if (typeof updateDashboardStats === 'function') updateDashboardStats();
      if (typeof updateActivityLog === 'function') updateActivityLog();
      alert('All videos have been removed.');
    }
  };

  // On load
  window.addEventListener('DOMContentLoaded', ()=>{
    if(isAuthed()) showDashboard();
  });
})();

