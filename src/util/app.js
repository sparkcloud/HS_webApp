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

    // --- NAVIGATION LISTENERS ---
    navCareerBtn.addEventListener('click', () => showView('career'));
    navProfileBtn.addEventListener('click', () => showView('profile'));

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