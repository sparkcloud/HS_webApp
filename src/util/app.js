if (window.__appInitialized) {
    console.log("App already initialized, skipping...");
} else {
    window.__appInitialized = true;
    console.log("app.js loaded!");

    // Initialize Supabase
    const supabaseUrl = 'https://maxhdworgaesxjmbcqqc.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGhkd29yZ2Flc3hqbWJjcXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDAyMzIsImV4cCI6MjA5MDU3NjIzMn0.CPfuGjP6Jw0NLwSDz_69TaKeSQSA6ZFCA9azYIYYP7s';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- DOM ELEMENTS ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const profileContainer = document.getElementById('profile-container');
    const mainNav = document.getElementById('main-nav');

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
        } else if (viewName === 'career') {
            appContainer.classList.remove('hidden');
            mainNav.classList.remove('hidden'); // Show nav
        } else if (viewName === 'profile') {
            profileContainer.classList.remove('hidden');
            mainNav.classList.remove('hidden'); // Show nav
        }
    }

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
            // 3. Changed to toLocaleString() to show both Date AND Exact Time
            const formattedDateTime = new Date(item.created_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            // 4. Injected the checkbox, storing the database row 'id' inside the value attribute
            const cardHTML = `
                <div class="history-card" id="card-${item.id}">
                    <input type="checkbox" class="delete-checkbox" value="${item.id}">
                    <div class="history-content">
                        <div class="history-date">Saved on: ${formattedDateTime}</div>
                        <p class="history-result">${item.pathway_result}</p>
                    </div>
                </div>
            `;

            historyList.innerHTML += cardHTML;
        });
    }

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

        const pathwaysMap = {
            'tech': 'Technology & Engineering 💻',
            'health': 'Health & Human Services 🤝',
            'arts': 'Creative Arts & Humanities 🎨'
        };

        const resultText = document.getElementById('result-text');
        const resultContainer = document.getElementById('result-container');

        resultText.textContent = pathwaysMap[winningPathway];
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