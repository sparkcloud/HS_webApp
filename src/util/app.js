if (window.__appInitialized) {
    console.log("App already initialized, skipping...");
} else {
    window.__appInitialized = true;
    console.log("app.js loaded!");

    // Initialize Supabase
    const supabaseUrl = 'https://maxhdworgaesxjmbcqqc.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGhkd29yZ2Flc3hqbWJjcXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDAyMzIsImV4cCI6MjA5MDU3NjIzMn0.CPfuGjP6Jw0NLwSDz_69TaKeSQSA6ZFCA9azYIYYP7s';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- PATHWAY COLOR CONFIGURATION ---
    const pathwayColors = {
        tech: {
            name: 'Technology & Engineering 💻',
            gradientStart: '#0056b3',
            gradientEnd: '#00d2ff'
        },
        health: {
            name: 'Health & Human Services 🤝',
            gradientStart: '#c41e3a',
            gradientEnd: '#ff6b6b'
        },
        arts: {
            name: 'Creative Arts & Humanities 🎨',
            gradientStart: '#2d5016',
            gradientEnd: '#6fa876'
        }
    };

    // --- DOM ELEMENTS ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const profileContainer = document.getElementById('profile-container');
    const mainNav = document.getElementById('main-nav');
    const navToggleBtn = document.getElementById('nav-toggle-btn');

    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const authMessage = document.getElementById('auth-message');

    // Navigation Buttons
    const navCareerBtn = document.getElementById('nav-career-btn');
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const navLogoutBtn = document.getElementById('nav-logout-btn');

    // --- DOM ELEMENTS
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');

    // --- ROUTING / VIEW LOGIC ---
    function showView(viewName) {
        // Hide all main containers first
        authContainer.classList.add('hidden');
        appContainer.classList.add('hidden');
        profileContainer.classList.add('hidden');

        // Show the requested container
        if (viewName === 'auth') {
            authContainer.classList.remove('hidden');
            mainNav.classList.add('hidden'); // Hide nav on login screen
            navToggleBtn.classList.add('hidden'); // Hide hamburger on login screen
        } else if (viewName === 'career') {
            appContainer.classList.remove('hidden');
            mainNav.classList.remove('hidden'); // Show nav
            mainNav.classList.remove('collapsed'); // Start expanded (not collapsed)
            navToggleBtn.classList.remove('hidden'); // Show hamburger
        } else if (viewName === 'profile') {
            profileContainer.classList.remove('hidden');
            mainNav.classList.remove('hidden'); // Show nav
            mainNav.classList.remove('collapsed'); // Start expanded (not collapsed)
            navToggleBtn.classList.remove('hidden'); // Show hamburger
        }
    }

    // --- HAMBURGER MENU TOGGLE ---
    navToggleBtn.addEventListener('click', () => {
        // On mobile: toggle 'open' class to show/hide menu
        // On desktop: toggle 'collapsed' class to collapse/expand menu
        if (window.innerWidth <= 768) {
            mainNav.classList.toggle('open');
        } else {
            mainNav.classList.toggle('collapsed');
        }
    });

    // Close nav when clicking a nav button (only on mobile)
    [navCareerBtn, navProfileBtn, navLogoutBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            // Only collapse on mobile (window width <= 768px)
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('open');
            }
        });
    });

    // --- FETCH USER HISTORY LOGIC ---
    async function loadUserProfile() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '<p>Loading your past results...</p>';
        deleteSelectedBtn.classList.add('hidden'); // Hide delete button while loading

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            historyList.innerHTML = '<p>Please log in to view your history.</p>';
            return;
        }

        // 1. IMPORTANT: We added 'id' to the select query so we know exactly which row to delete
        const { data, error } = await supabase
            .from('predictions')
            .select('id, pathway_result, created_at')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching history:", error.message);
            historyList.innerHTML = '<p style="color: red;">Failed to load history.</p>';
            return;
        }

        if (!data || data.length === 0) {
            historyList.innerHTML = '<p>You have no saved pathways yet. Go to the Career Tool to get started!</p>';
            return;
        }

        // 2. Data exists, so show the delete button
        deleteSelectedBtn.classList.remove('hidden');
        historyList.innerHTML = '';

        data.forEach(item => {
            const formattedDateTime = new Date(item.created_at).toLocaleString(undefined, {
                dateStyle: 'medium', timeStyle: 'short'
            });

            // 1. RE-GENERATE THE IMAGE ON THE FLY
            const imageUrl = createCardDataUrl(item.pathway_result);

            // 2. PREPARE SHARE TEXT
            const appUrl = encodeURIComponent(window.location.origin + window.location.pathname);
            const shareText = encodeURIComponent(`I matched with the ${item.pathway_result}! Find your path: `);

            // 3. INJECT THE IMAGE AND BUTTONS
            // We use 'data-' attributes to store the info the buttons need when clicked
            const cardHTML = `
                <div class="history-card" id="card-${item.id}">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" class="delete-checkbox" value="${item.id}">
                            <div>
                                <div class="history-date">Saved on: ${formattedDateTime}</div>
                                <p class="history-result">${item.pathway_result}</p>
                            </div>
                        </div>
                    </div>
                    
                    <img src="${imageUrl}" alt="Result Card" style="width: 100%; max-width: 400px; border-radius: 8px; margin-top: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    
                    <div class="profile-share-actions" style="display: flex; gap: 5px; margin-top: 10px; flex-wrap: wrap;">
                        <button class="prof-btn prof-dl" data-img="${imageUrl}" style="background: #28a745; font-size: 0.8rem; padding: 5px 10px;">💾 Download</button>
                        <button class="prof-btn prof-x" data-text="${shareText}" data-url="${appUrl}" style="background: #000; font-size: 0.8rem; padding: 5px 10px;">X</button>
                        <button class="prof-btn prof-in" data-url="${appUrl}" style="background: #0077b5; font-size: 0.8rem; padding: 5px 10px;">LinkedIn</button>
                        <button class="prof-btn prof-copy" data-text="${shareText}" data-url="${appUrl}" style="background: #6c757d; font-size: 0.8rem; padding: 5px 10px;">📋 Copy Link</button>
                    </div>
                </div>
            `;

            historyList.innerHTML += cardHTML;
        });
    }

// --- PROFILE SHARING EVENT LISTENER ---
document.getElementById('history-list').addEventListener('click', async (e) => {
    const target = e.target;

    // If they didn't click a profile share button, ignore it
    if (!target.classList.contains('prof-btn')) return;

    // Grab the data we hid inside the HTML attributes
    const imgData = target.getAttribute('data-img');
    const text = target.getAttribute('data-text');
    const url = target.getAttribute('data-url');

    if (target.classList.contains('prof-dl')) {
        const link = document.createElement('a');
        link.download = 'Past_Pathway_Card.png';
        link.href = imgData;
        link.click();
    }
    else if (target.classList.contains('prof-x')) {
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
    else if (target.classList.contains('prof-in')) {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }
    else if (target.classList.contains('prof-copy')) {
        try {
            const plainText = decodeURIComponent(text) + decodeURIComponent(url);
            await navigator.clipboard.writeText(plainText);
            alert("Text copied! Ready to paste into Slack or Discord.");
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
});

    // --- DELETE SELECTED LOGIC ---
    deleteSelectedBtn.addEventListener('click', async () => {
        // Find every checkbox on the screen that is currently "checked"
        const checkedBoxes = document.querySelectorAll('.delete-checkbox:checked');

        if (checkedBoxes.length === 0) {
            alert('Please check the box next to the entries you want to delete.');
            return;
        }

        // Confirm before deleting (always good practice for destructive actions)
        if (!confirm(`Are you sure you want to delete ${checkedBoxes.length} saved result(s)?`)) {
            return;
        }

        // Extract the database IDs from the checked boxes into an array
        const idsToDelete = Array.from(checkedBoxes).map(box => box.value);

        // Tell Supabase to delete where the row ID is IN our array of selected IDs
        const { error } = await supabase
            .from('predictions')
            .delete()
            .in('id', idsToDelete);

        if (error) {
            console.error("Error deleting entries:", error.message);
            alert("There was a problem deleting your entries. Please try again.");
        } else {
            console.log("Successfully deleted entries.");
            // Reload the profile screen to instantly reflect the deleted items
            loadUserProfile();
        }
    });

    // --- NAVIGATION LISTENERS ---
    navCareerBtn.addEventListener('click', () => showView('career'));
    navProfileBtn.addEventListener('click', () => {
        loadUserProfile(); // Fetch the data
        showView('profile'); // Show the screen
    });

    navLogoutBtn.addEventListener('click', async () => {
        // Tell Supabase to destroy the secure session
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            console.log("Logged out successfully.");
            // Reset the UI
            document.getElementById('result-container').classList.add('hidden');
            authMessage.textContent = "";
            showView('auth');
        }
    });

    // --- SIGN UP LOGIC ---
    signupBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        authMessage.textContent = "Loading...";

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.textContent = error.message;
        } else {
            try {
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id
                });

                if (profileError) {
                    authMessage.style.color = 'red';
                    authMessage.textContent = 'Account created but profile setup failed. Please try logging in.';
                    console.error('Error creating profile:', profileError.message);
                } else {
                    authMessage.style.color = 'green';
                    authMessage.textContent = "Success! You can now Log In.";
                }
            } catch (err) {
                authMessage.style.color = 'red';
                authMessage.textContent = 'Account created but profile setup failed. Please try logging in.';
                console.error('Error creating profile:', err.message);
            }
        }
    });

    // --- LOG IN LOGIC ---
    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        authMessage.textContent = "Loading...";

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.textContent = error.message;
        } else {
            console.log("Login successful! User data:", data.user);

            // Clear inputs and route to the career tool
            emailInput.value = '';
            passwordInput.value = '';
            authMessage.textContent = '';
            showView('career');
        }
    });

    // --- PURE CANVAS GENERATOR ---
    function createCardDataUrl(pathwayKey) {
        // Get the color config for this pathway
        const colorConfig = pathwayColors[pathwayKey];

        // Create a canvas element directly in memory (doesn't need to be in the HTML)
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Draw Background with pathway-specific colors
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, colorConfig.gradientStart);
        gradient.addColorStop(1, colorConfig.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Decorative Shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.arc(100, 100, 150, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(500, 350, 200, 0, Math.PI * 2); ctx.fill();

        // Draw Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('My Recommended High School Pathway is:', canvas.width / 2, 150);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(colorConfig.name, canvas.width / 2, 220);
        ctx.font = '20px sans-serif';
        ctx.fillText('Discover your path at Pathway Predictor!', canvas.width / 2, 350);

        // Return the final image URL
        return canvas.toDataURL('image/png');
    }

    // --- SETUP SHARING LISTENERS ---
    function setupSharing(pathwayKey, imageDataUrl, pathwayName) {
        // We will use your GitHub Pages URL here once deployed. 
        // For now, we use a placeholder or window.location.href.
        const appUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(`I just matched with the ${pathwayName} on Pathway Predictor! Find your path: `);

        // Download Image (For Insta/TikTok)
        document.getElementById('download-btn').onclick = () => {
            const link = document.createElement('a');
            link.download = 'My_Pathway_Card.png';
            link.href = imageDataUrl;
            link.click();
        };

        // X (Twitter)
        document.getElementById('share-x-btn').onclick = () => {
            window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${appUrl}`, '_blank');
        };

        // LinkedIn
        document.getElementById('share-linkedin-btn').onclick = () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}`, '_blank');
        };

        // Email
        document.getElementById('share-email-btn').onclick = () => {
            window.location.href = `mailto:?subject=My Pathway Result&body=${shareText} ${appUrl}`;
        };

        // Copy to Clipboard (Discord/Slack)
        document.getElementById('copy-link-btn').onclick = async () => {
            try {
                const plainText = decodeURIComponent(shareText) + window.location.href;
                await navigator.clipboard.writeText(plainText);
                alert("Text copied to clipboard! Paste it in Discord or Slack.");
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            };
        }

    // --- PATHWAY PREDICTOR LOGIC ---
    document.getElementById('predict-btn').addEventListener('click', async () => {
        const val1 = document.getElementById('q1').value;
        const val2 = document.getElementById('q2').value;
        const val3 = document.getElementById('q3').value;
        const choices = [val1, val2, val3];

        const counts = {};
        choices.forEach(choice => { counts[choice] = (counts[choice] || 0) + 1; });

        let highestCount = 0;
        let winningPathway = choices[0];

        for (const path in counts) {
            if (counts[path] > highestCount) {
                highestCount = counts[path];
                winningPathway = path;
            }
        }

        // Get the display name from the pathway colors config
        const pathwayConfig = pathwayColors[winningPathway];
        const pathwayDisplayName = pathwayConfig.name;

        const resultText = document.getElementById('result-text');
        const resultContainer = document.getElementById('result-container');

        resultText.textContent = pathwayDisplayName;

        // Generate the image with the correct pathway color and pass the pathway key
        const generatedImageUrl = createCardDataUrl(winningPathway);
        document.getElementById('share-image').src = generatedImageUrl;

        // Wire up the buttons with the new data, passing both the key and display name
        setupSharing(winningPathway, generatedImageUrl, pathwayDisplayName);

        resultContainer.classList.remove('hidden');

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User auth error:', userError?.message);
                return;
            }

            const { data, error } = await supabase.from('predictions').insert(
                { profile_id: user.id, pathway_result: winningPathway },
                { returning: 'minimal' }
            );

            if (error) {
                console.error('Error saving prediction:', error.message);
            } else {
                console.log('Prediction saved:', winningPathway);
            }
        } catch (err) {
            console.error('Unexpected error:', err.message);
        }
    });
}