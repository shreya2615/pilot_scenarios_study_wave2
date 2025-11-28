/* ---------- Participant ID ---------- */
const urlParams = new URLSearchParams(window.location.search);
const PARTICIPANT_ID = urlParams.get('PID') || `P${Math.floor(Math.random() * 1e9)}`;


/* ---------- Firebase Config & Init ---------- */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBF_kPxifBa13lnW6UQecmsyJqjQYnAZpA",
  authDomain: "pilot-scenarios-study-wave2.firebaseapp.com",
  projectId: "pilot-scenarios-study-wave2",
  storageBucket: "pilot-scenarios-study-wave2.firebasestorage.app",
  messagingSenderId: "897783349168",
  appId: "1:897783349168:web:c9afff73cf2e79657d6075",
  measurementId: "G-N1VNGTL0GH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a handle to the Realtime Database
const database = firebase.database();

// Each participant gets their own node under pilot_scenarios_simple
const responsesRef = database.ref('pilot_scenarios_simple').child(PARTICIPANT_ID);

/* ---------- Initialize jsPsych ---------- */
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: true,
    on_finish: async () => {
        // Grab only rating trials
        const ratingTrials = jsPsych.data.get().filter({ phase: "rating" }).values();
        const timestamp = new Date().toISOString();
        const writes = [];

        ratingTrials.forEach(trial => {
            let ratingValue = null;

            // jsPsych 7: survey-html-form puts answers in trial.response
            if (trial.response && typeof trial.response === "object") {
                if (trial.response.rating !== undefined) {
                    ratingValue = parseInt(trial.response.rating, 10);
                }
            } else if (trial.responses) {
                // Fallback for older format (JSON string)
                try {
                    const resp = JSON.parse(trial.responses || "{}");
                    if (resp.rating !== undefined) {
                        ratingValue = parseInt(resp.rating, 10);
                    }
                } catch (e) {
                    console.error("Error parsing trial.responses JSON:", trial.responses, e);
                }
            }

            const payload = {
                participant_id: PARTICIPANT_ID,
                scenario_id: trial.scenario || null,
                candidate: trial.candidate || null,
                phase: trial.phase || null,
                rating: ratingValue,
                rt: trial.rt ?? null,
                trial_index: trial.trial_index ?? null,
                timestamp: timestamp
            };

            writes.push(responsesRef.push(payload));
        });

        try {
            await Promise.all(writes);
        } catch (err) {
            console.error("Firebase write failed:", err);
        }

        // Original end-of-experiment message
        document.body.innerHTML = `
            <h2>Thank you!</h2>
            <p>You have completed the experiment.</p>
        `;
    }
});

/* ---------- Scenario Definitions ---------- */
const scenarios = [
    {
        name: "ECE Scenario 1",
        id: "ece1",
        jobDescription: `
            <h2>Early Childhood Educator (ECE) Position</h2>
            <p><strong>Location:</strong> Toronto, ON</p>
            <p><strong>About the Company:</strong> Little Steps Early Learning Centre is a large, multi-centre daycare 
            located in various parts of the Greater Toronto Area. Our downtown Toronto centre currently serves 45 children 
            with a team of 8 dedicated staff members. Recently, the centre has been facing increasing challenges related to 
            (i) staff adopting to new curriculum regulations and (ii) classroom management and disruptive behaviour. As a result, 
            the centre is seeking an Early Childhood Educator (ECE) who can provide a firm lead to staff and navigate both staff 
            and classroom conflict effectively.   </p>
        `,
        candidates: [
            { name: "Jess", description: "I have worked as a daycare supervisor in the city for the past five years, managing classroom dynamics, staff, and behavioural difficulties. When our center adopted a new play-based curriculum, I supported staff by facilitating planning sessions and sharing strategies that made the shift feel manageable and aligned with their teaching styles. As a supervisor I’ve also managed incidents between children involving disruptive behaviours during class time. By implementing firm and consistent expectations, I was able to prevent further outbursts." },
            { name: "Mary", description: "For the past three years, I have worked as a staff lead at a preschool where I take pride in fostering a positive team culture rooted in accountability, communication, and respect. This focus on team culture shaped how I support staff through change and new initiatives. As we adopted changes in the curriculum, I collaborated with staff to create simple templates and provide hands-on support. This helped reduce stress and misunderstanding and facilitated greater consistency across classrooms." },
            { name: "Rebecca", description: "I have three years of experience working as an educator at a learning centre in downtown Toronto. In that role, I guided children through daily activities to support their learning and development. I worked closely with children to build routines that encouraged engagement and confidence. For instance, I regularly led circle time activities, prompting children to participate in games and sing-alongs. Outside of work, I coach a youth soccer team and have received recognition for leading the most improved team." }
        ]
    },
    {
        name: "ECE Scenario 2",
        id: "ece2",
        jobDescription: `
            <h2>Early Childhood Educator (ECE) Position</h2>
            <p><strong>Location:</strong> Vancouver, BC</p>
            <p><strong>About the Company:</strong> Early Minds Academy is a large, multi-centre daycare located in various parts of 
            the Greater Vancouver Area. Our downtown Vancouver centre currently serves 45 children with a team of 8 dedicated staff members. 
            At this time, the centre is in the process of enhancing its program to align more closely with modern child-centered approaches 
            that prioritize emotional development and interpersonal learning. As a result, the centre is seeking an Early Childhood Educator 
            (ECE) who is warm, nurturing, and emotionally attuned and keeps abreast of recent research in child development. The ideal candidate 
            will foster close relationships with children and families and bring new proven techniques to the classroom.</p>
        `,
        candidates: [
            { name: "Julia", description: "I spent the past two years working in toddler and preschool classrooms. In these roles, my main focus was helping to plan activities and maintain structured routines for the lead educators to follow. As an activity planner, I communicated effectively with lead educators to develop cohesive daily routines and have maintained contact with many of them even after my contract ended. I highly value continual growth and am always researching new activities that maximize children’s learning and healthy development." },
            { name: "Maya", description: "For the past three years, I have worked at a preschool on children’s developmental milestones. I value the importance of clear communication, and I like to host a monthly ‘family morning’ where parents and children can join in on a circle time activity and parents chat informally about their child’s progress. Outside of work, I regularly take professional development courses that I can apply to my own role, as I strongly believe in the value of evidence based educational strategies." },
            { name: "Naomi", description: "I have four years of experience working as a classroom assistant, helping implement learning activities and supporting daily routines. I make the effort to speak with parents informally during drop-off and pickup, and I appreciate how these interactions can help build trust overtime. I’ve also volunteered at local community events, allowing me to collaborate with different age groups and support environments that bring people together. These are values I hope to bring into my work with children and their families. " }
        ]
    },
    {
        name: "CEO Scenario 1",
        id: "ceo1",
        jobDescription: `
            <h2>Chief Executive Officer (CEO) Position</h2>
            <p><strong>Location:</strong> Toronto, ON</p>
            <p><strong>About the Company:</strong> NovaLink is a Canadian tech firm, with a team of 5000 employees, 
            that builds smart software to help companies manage their supply chains. We’ve grown across North America 
            and are now preparing to expand into Europe. At the same time, we’re dealing with a hostile takeover attempt 
            from a U.S. competitor. We want to remain independent and grow internationally, without losing our focus or 
            team stability. We are looking for a new CEO to help navigate these challenges and opportunities.</p>
        `,
        candidates: [
            { name: "Richard", description: "In my last role, I oversaw expansion of the company into Germany and the Netherlands. I speak German and have a network of contacts in both countries. Shortly after initiating the expansion, we were confronted by an aggressive takeover attempt. I worked directly with the board and our lawyers, investors, and regulators to fend off the aggression and safeguard shareholder value, while also keeping focus on our long-term corporate goals. I keep people calm and grounded when things heat up." },
            { name: "Scott", description: "I have successfully led the launch of software technology products in Europe as the vice president of a multinational company. I also helped set up our first offices and client networks in both Germany and Spain. I am fully conversant in German and French, and I know how to effectively navigate cultural and regulatory differences in various contexts. I’m excited about helping companies grow across borders and I like being the person who connects the dots between people and markets." },
            { name: "John", description: "I have successfully led corporate organizations through intense and challenging internal changes, including board turnover and investor turmoil, while helping the company maintain steady focus and consistently grow profits over time. I have also worked very closely with legal teams on contract disputes, negotiations, and restructuring plans. What I bring to the table is the ability to keep a company calm, collected, and focused while things shift around them." }
        ]
    },
    {
        name: "CEO Scenario 2",
        id: "ceo2",
        jobDescription: `
            <h2>Chief Executive Officer (CEO) Position</h2>
            <p><strong>Location:</strong> Vancouver, BC</p>
            <p><strong>About the Company:</strong> GreenPath develops software to help other companies 
            track and reduce their environmental impact in Canada and Europe. We’ve grown quickly to a 
            team of 500, but that growth has created new pressures. We’ve fallen behind in updating our 
            tools and platforms to keep up with new climate regulations, particularly in Europe. Furthermore, 
            our switch back from remote to in-office mode after the COVID lockdowns has left some staff dissatisfied 
            and unheard. We now want to consolidate and focus on doing two things better: staying ahead of environmental 
            standards and making GreenPath a more connected and desirable place to work. We are looking for a new CEO to 
            help us achieve these goals. </p>
        `,
        candidates: [
            { name: "James", description: "I was appointed VP head of human resources while my current company was struggling with low morale and employee retention. My approach was to empathize and view the situation from the employee’s perspective. I initiated steps to make the employees feel heard at every level.  This led to the opening of corporate daycare facilities and encouraging flexible hours. We also initiated regular company retreats to reinforce team cohesion. After three years our employee retention rate is 95% and corporate morale at an all-time high. I believe engaged, motivated employees are essential to long-term success and overall profitability." },
            { name: "Thomas", description: "As vice president of a multinational green tech company, I led system updates in Germany and France to help clients comply with new EU climate regulations. Around the same time, COVID restrictions forced a shift to remote work, which caused isolation, low morale, and a loss of shared purpose. I implemented several initiatives to address these challenges, resulting in an 67% increase in retention and a 73% boost in job satisfaction over the next three years. To me, leadership means being steady, compassionate, empathetic, and mission-focused. I still bike to work and strive to live by the values we promote." },
            { name: "Brian", description: "I have held leadership positions at the vice president level in both marketing and finance across several well-established multinational corporations. In my marketing role, we successfully increased U.S. market share by 12% over a two-year period under my direct leadership. In the finance position, I implemented strategic measures to reduce company debt and boost shareholder equity, which ultimately resulted in a 54% increase in our stock value. I consider myself a well-rounded, seasoned corporate executive with a strong track record of results who can position your organization for sustained growth and long-term profitability." }
        ]
    }
];

/* ---------- FUNCTION TO CREATE DESCRIPTION-ONLY TRIALS WITH CIRCLE RATINGS ---------- */
function createDescriptionRatingTrial(candidate, scenario) {
    // Build black circle buttons
    const optionsHtml = Array.from({length: 7}, (_, i) => `
        <label class="circle-option">
            <input type="radio" name="rating" value="${i+1}" required>
            <span class="circle"></span>
            <div class="circle-label">${i+1}</div>
        </label>
    `).join("");

    return {
        type: jsPsychSurveyHtmlForm,
        preamble: `
            <div style="padding: 0 20px;">
                <h2>${scenario.name}</h2>
                ${scenario.jobDescription}
            </div>
            <hr>
            <strong>${candidate.name}</strong>: ${candidate.description}<br><br>
            <p style="margin-top: 15px;">Rate how likely you are to recommend this candidate to be hired on a scale from 1 to 7 (1 = Not Likely, 7 = Very Likely).</p>
        `,
        html: `<div class="circle-container">${optionsHtml}</div>`,
        button_label: "Submit",
        data: {scenario: scenario.id, candidate: candidate.name, phase: "rating"}     
    };
}

// Use all 4 scenarios and shuffle
const randomizedScenarios = jsPsych.randomization.shuffle(scenarios);


/* ---------- Build Timeline ---------- */
let timeline = [];

var consent_html = `
<div style="display:flex; justify-content:center;">
  <div id="consent-box" style="width: 80%; height: 1200px; margin: auto; border: 1px solid #ccc; padding: 20px; height: 300px; overflow-y: scroll;">
  <h2>Informed Consent</h2>


<p><strong>Researchers:</strong><br>
  Eshnaa Aujla, graduate student (eshnaa15@yorku.ca)<br>
  Shreya Sharma, graduate student (ssharm29@york.ca)<br>
  Supervisor: Vinod Goel, vgoel@yorku.ca</p>

  <p>We invite you to take part in this research study. Please read this document and discuss any questions or concerns that you may have with the Investigator.</p>

  <p><strong>Purpose of the Research:</strong> This project investigates the cognitive structures and processes underlying human reasoning & problem-solving abilities. The tasks vary between conditions but all involve attending to linguistic or visual stimuli and making a perceptual or cognitive judgment, usually on a computer screen.</p>

  <p><strong>What You Will Be Asked to Do:</strong> You will be asked to complete a self questionnaire. After viewing images or audios, you will be asked to make certain judgements.</p>

  <p><strong>Risks and Discomforts:</strong> We do not foresee any risks or discomfort from your participation in the research. You may, however, experience some frustration or stress if you believe that you are not doing well. Certain participants may have difficulty with some of the tasks. If you do feel discomfort you may withdraw at any time.</p>

  <p><strong>Benefits:</strong> There is no direct benefit to you, but knowledge may be gained that may help others in the future. The study takes approximately 20 minutes to complete, and you will receive $5.00 USD for your participation.</p>

  <p><strong>Voluntary Participation:</strong> Your participation is entirely voluntary and you may choose to stop participating at any time. Your decision will not affect your relationship with the researcher, study staff, or York University.</p>

  <p><strong>Withdrawal:</strong> You may withdraw at any time. If you withdraw, all associated data will be destroyed immediately.</p>

  <p><strong>Secondary Use of Data:</strong> De-identified data may be used in later related studies by the research team, but only in anonymous form and only following ethics review.</p>

  <p><strong>Confidentiality:</strong> All data will be collected anonymously. Data will be stored in a secure online system accessible only to the research team. Confidentiality cannot be guaranteed during internet transmission. Your data may be deposited in a publicly accessible scientific repository in fully anonymized form. No identifying information will be included.</p>

  <p><strong>Questions?</strong> For questions about the study, contact Dr. Vinod Goel, Eshnaa Aujla, or Shreya Sharma. For questions about your rights, contact York University's Office of Research Ethics at ore@yorku.ca.</p>

  <p><strong>Legal Rights and Signatures:</strong><br>
  By selecting “I consent to participate,” you indicate that you have read and understood the information above and agree to participate voluntarily.</p>
</div>
`;

timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: consent_html,
  choices: ["I consent to participate", "I do NOT consent to participate"],
  on_load: function() {
    let box = document.getElementById("consent-box");
    let buttons = document.querySelectorAll(".jspsych-btn");
    
    // disable buttons initially
    buttons.forEach(btn => btn.disabled = true);

    box.addEventListener("scroll", function() {
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 5) {
        buttons.forEach(btn => btn.disabled = false);
      }
    });
  },
  on_finish: function(data) {
      if (data.response === 1) { // user does NOT consent
          // Clear the timeline and show a custom message
          document.body.innerHTML = `
              <div style="width: 70%; margin: 100px auto; text-align: center;">
                  <h2>Consent Not Given</h2>
                  <p>You chose not to provide consent. The study has ended.</p>
              </div>
          `;
          jsPsych.endExperiment(); // stop the experiment cleanly
    }
  }
});

// Instructions
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Welcome to the Experiment!</h2>
        <p>Imagine you are a recruiter at NorthStar Talent Collective. NorthStar helps in the identification and recruitment of employees ranging from CEOs to school teachers.</p>
        <p>You are in charge of reviewing candidate profiles for several different portfolios.</p>
        <p>Two companies are looking to hire a new <strong>Chief Executive Officer (CEO)</strong> and two companies are looking to hire a new <strong>Early Childhood Educator (ECE)</strong>.</p>
        <p>You will be presented with information about each company including the qualifications they are looking for in a new employee, and the profiles of three candidates applying for each position.</p>
        <p>Your job is to evaluate each candidate and indicate how likely you would be to recommend them for the position considering the companies' requirements.</p>
        <p>Press <strong>SPACE</strong> to begin.</p>
    `,
    choices: [" "]
});


// Loop through each scenario
let ordinalLabels = ["first", "second", "third", "fourth"];

randomizedScenarios.forEach((scenario, index) => {
    // transition page before each scenario
    timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <h2>You will now be presented with the ${ordinalLabels[index]} company scenario.</h2>
            <p>Press <strong>SPACE</strong> to continue.</p>
        `,
        choices: [" "]
    });

    // scenario description page
    timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="padding: 0 20px;">
                <h2>${scenario.name}</h2>
                ${scenario.jobDescription}
            </div>
            <p>Press <strong>SPACE</strong> to continue to the candidates.</p>
        `,
        choices: [" "]
    });
  
    // Randomized candidate trials
    const randomizedCandidates = jsPsych.randomization.shuffle(scenario.candidates);
    randomizedCandidates.forEach(candidate => {
        timeline.push(createDescriptionRatingTrial(candidate, scenario));
    });
});

// Final message
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<h2>Thank you for participating in this study!</h2><p>You have completed the experiment and your response has been recorded.</p>`,
    choices: "NO_KEYS",
    trial_duration: 4000
});

/* ---------- Run Experiment ---------- */
jsPsych.run(timeline);
