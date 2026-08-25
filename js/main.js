/* ==========================================================================
   REPUP — MAIN.JS
   Functional layer for the RepUp HTML + CSS interface.
   ========================================================================== */

(() => {
    "use strict";

    /* ======================================================================
       01. DATA
       ====================================================================== */

    const exercises = [
        {
            id: "bench-press",
            name: "Bench Press",
            category: "chest",
            categoryLabel: "Pecho",
            equipment: "Barra",
            level: "Intermedio",
            description: "Press horizontal con barra.",
            sets: 4,
            reps: 8,
            weight: 80
        },
        {
            id: "incline-dumbbell-press",
            name: "Press inclinado con mancuernas",
            category: "chest",
            categoryLabel: "Pecho",
            equipment: "Mancuernas",
            level: "Intermedio",
            description: "Press inclinado para pecho superior.",
            sets: 3,
            reps: 10,
            weight: 30
        },
        {
            id: "pull-up",
            name: "Pull Up",
            category: "back",
            categoryLabel: "Espalda",
            equipment: "Peso corporal",
            level: "Intermedio",
            description: "Dominada pronada.",
            sets: 4,
            reps: 8,
            weight: 0
        },
        {
            id: "barbell-row",
            name: "Barbell Row",
            category: "back",
            categoryLabel: "Espalda",
            equipment: "Barra",
            level: "Intermedio",
            description: "Remo con barra.",
            sets: 4,
            reps: 8,
            weight: 70
        },
        {
            id: "squat",
            name: "Back Squat",
            category: "legs",
            categoryLabel: "Piernas",
            equipment: "Barra",
            level: "Avanzado",
            description: "Sentadilla trasera con barra.",
            sets: 4,
            reps: 6,
            weight: 100
        },
        {
            id: "hack-squat",
            name: "Hack Squat",
            category: "legs",
            categoryLabel: "Piernas",
            equipment: "Máquina",
            level: "Intermedio",
            description: "Sentadilla en máquina hack.",
            sets: 3,
            reps: 10,
            weight: 120
        },
        {
            id: "shoulder-press",
            name: "Shoulder Press",
            category: "shoulders",
            categoryLabel: "Hombros",
            equipment: "Mancuernas",
            level: "Intermedio",
            description: "Press vertical para hombros.",
            sets: 3,
            reps: 10,
            weight: 24
        },
        {
            id: "lateral-raise",
            name: "Lateral Raise",
            category: "shoulders",
            categoryLabel: "Hombros",
            equipment: "Mancuernas",
            level: "Principiante",
            description: "Elevación lateral.",
            sets: 3,
            reps: 15,
            weight: 10
        },
        {
            id: "barbell-curl",
            name: "Barbell Curl",
            category: "arms",
            categoryLabel: "Brazos",
            equipment: "Barra",
            level: "Intermedio",
            description: "Curl de bíceps con barra.",
            sets: 3,
            reps: 10,
            weight: 30
        }
    ];

    const defaultWorkout = [
        "bench-press",
        "incline-dumbbell-press",
        "shoulder-press",
        "lateral-raise",
        "barbell-curl"
    ];

    const state = {
        currentView: "home",

        builder: {
            step: 1,
            goal: null,
            level: null,
            days: [],
            equipment: null
        },

        workout: {
            exercises: [...defaultWorkout],
            currentIndex: 0,
            completedSets: {},
            weight: 80,
            restSeconds: 90,
            timer: null,
            running: false,
            completed: false
        },

        library: {
            filter: "all",
            query: ""
        },

        coach: {
            messages: []
        },

        progress: {
            period: "8-weeks"
        }
    };


    /* ======================================================================
       02. DOM HELPERS
       ====================================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const getExercise = (id) =>
        exercises.find((exercise) => exercise.id === id);

    const getCurrentWorkoutExercise = () =>
        getExercise(state.workout.exercises[state.workout.currentIndex]);


    /* ======================================================================
       03. LOCAL STORAGE
       ====================================================================== */

    const saveState = () => {
        const stateToSave = {
            builder: state.builder,

            workout: {
                exercises: state.workout.exercises,
                currentIndex: state.workout.currentIndex,
                completedSets: state.workout.completedSets,
                weight: state.workout.weight,
                completed: state.workout.completed
            },

            progress: state.progress
        };

        localStorage.setItem(
            "repup-state",
            JSON.stringify(stateToSave)
        );
    };


    const loadState = () => {
        const saved = localStorage.getItem("repup-state");

        if (!saved) {
            return;
        }

        try {
            const parsed = JSON.parse(saved);

            if (parsed.builder) {
                state.builder = {
                    ...state.builder,
                    ...parsed.builder
                };
            }

            if (parsed.workout) {
                state.workout = {
                    ...state.workout,
                    ...parsed.workout,

                    timer: null,
                    running: false,
                    restSeconds: 90
                };
            }

            if (parsed.progress) {
                state.progress = {
                    ...state.progress,
                    ...parsed.progress
                };
            }

        } catch (error) {
            console.warn(
                "RepUp: no se pudo cargar el estado.",
                error
            );
        }
    };


    /* ======================================================================
       04. NAVIGATION
       ====================================================================== */

    function navigate(view) {

        const validViews = [
            "home",
            "builder",
            "workout",
            "progress",
            "exercises"
        ];

        if (!validViews.includes(view)) {
            view = "home";
        }

        state.currentView = view;

        $$(".view").forEach((section) => {

            const isActive =
                section.dataset.viewSection === view;

            section.classList.toggle(
                "view--active",
                isActive
            );
        });


        $$("[data-view]").forEach((link) => {

            const isActive =
                link.dataset.view === view;

            link.classList.toggle(
                "navigation-link--active",
                isActive
            );

            link.classList.toggle(
                "bottom-navigation__item--active",
                isActive
            );
        });


        if (window.location.hash !== `#${view}`) {

            history.pushState(
                null,
                "",
                `#${view}`
            );
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        if (view === "home") {
            renderHome();
        }

        if (view === "builder") {
            renderBuilder();
        }

        if (view === "workout") {
            renderWorkout();
        }

        if (view === "progress") {
            renderProgress();
        }

        if (view === "exercises") {
            renderExerciseLibrary();
        }
    }


    function initializeNavigation() {

        $$("[data-view]").forEach((element) => {

            element.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    navigate(
                        element.dataset.view
                    );
                }
            );
        });


        window.addEventListener(
            "popstate",
            () => {

                const view =
                    window.location.hash.replace("#", "");

                navigate(
                    view || "home"
                );
            }
        );
    }


    /* ======================================================================
       05. TOAST
       ====================================================================== */

    let toastTimeout;


    function showToast(message) {

        const toast =
            $("#toast");

        const messageElement =
            $("#toast-message");


        if (!toast || !messageElement) {
            return;
        }


        messageElement.textContent =
            message;


        toast.classList.add(
            "toast--visible"
        );


        clearTimeout(
            toastTimeout
        );


        toastTimeout = setTimeout(() => {

            toast.classList.remove(
                "toast--visible"
            );

        }, 2600);
    }


    /* ======================================================================
       06. MODALS
       ====================================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    }


    function closeModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        const anyOpenModal =
            $('.modal[aria-hidden="false"]');


        if (!anyOpenModal) {

            document.body.style.overflow =
                "";
        }
    }


    function initializeModals() {

        $$("[data-close-modal]").forEach(
            (element) => {

                element.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            element.dataset.closeModal
                        );
                    }
                );
            }
        );


        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key !== "Escape") {
                    return;
                }


                const openModalElement =
                    $('.modal[aria-hidden="false"]');


                if (openModalElement) {

                    closeModal(
                        openModalElement.id
                    );
                }
            }
        );
    }


    /* ======================================================================
       07. HOME
       ====================================================================== */

    function renderHome() {

        const totalExercises =
            state.workout.exercises.length;


        const completedExercises =
            state.workout.exercises.filter(
                (id, index) => {

                    const exercise =
                        getExercise(id);

                    return isExerciseComplete(
                        exercise,
                        index
                    );
                }
            ).length;


        const percentage =
            totalExercises
                ? Math.round(
                    (completedExercises /
                        totalExercises) *
                    100
                )
                : 0;


        const percentText =
            $("#home-progress-percent");


        const progress =
            $("#home-progress");


        const progressBar =
            $("#home-progress-bar");


        const exerciseCount =
            $("#home-exercise-count");


        if (percentText) {

            percentText.textContent =
                `${percentage}%`;
        }


        if (progress) {

            progress.setAttribute(
                "aria-valuenow",
                String(percentage)
            );
        }


        if (progressBar) {

            progressBar.style.width =
                `${percentage}%`;
        }


        if (exerciseCount) {

            exerciseCount.textContent =
                `${completedExercises} / ${totalExercises}`;
        }


        const list =
            $("#home-exercise-list");


        if (!list) {
            return;
        }


        list.innerHTML = "";


        state.workout.exercises.forEach(
            (id, index) => {

                const exercise =
                    getExercise(id);


                if (!exercise) {
                    return;
                }


                const complete =
                    isExerciseComplete(
                        exercise,
                        index
                    );


                const row =
                    document.createElement(
                        "article"
                    );


                row.className =
                    `exercise-row${
                        complete
                            ? " exercise-row--complete"
                            : ""
                    }`;


                row.innerHTML = `

                    <span class="exercise-row__number">

                        ${
                            complete
                                ? "✓"
                                : String(index + 1)
                                    .padStart(2, "0")
                        }

                    </span>


                    <span class="exercise-row__info">

                        <span class="exercise-row__name">

                            ${escapeHtml(
                                exercise.name
                            )}

                        </span>


                        <span class="exercise-row__target">

                            ${exercise.sets}
                            series ×
                            ${exercise.reps}
                            reps

                        </span>

                    </span>


                    <span class="exercise-row__status">

                        ${
                            complete
                                ? "Completado"
                                : "Pendiente"
                        }

                    </span>

                `;


                list.appendChild(row);
            }
        );
    }


    function isExerciseComplete(
        exercise,
        index
    ) {

        if (!exercise) {
            return false;
        }


        const completed =
            state.workout.completedSets[
                exercise.id
            ] || [];


        return (
            completed.length >=
            exercise.sets
        );
    }


    /* ======================================================================
       08. ROUTINE BUILDER
       ====================================================================== */

    function initializeBuilder() {

        $$("[data-builder-step]").forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const step =
                            Number(
                                button.dataset.builderStep
                            );


                        if (
                            step <=
                            state.builder.step + 1
                        ) {

                            setBuilderStep(
                                step
                            );
                        }
                    }
                );
            }
        );


        $$("[data-next-builder-step]").forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const next =
                            Number(
                                button.dataset
                                    .nextBuilderStep
                            );

                        setBuilderStep(
                            next
                        );
                    }
                );
            }
        );


        $$("[data-previous-builder-step]").forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const previous =
                            Number(
                                button.dataset
                                    .previousBuilderStep
                            );

                        setBuilderStep(
                            previous
                        );
                    }
                );
            }
        );


        $$("[data-choice]").forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const type =
                            button.dataset.choice;

                        const value =
                            button.dataset.value;


                        state.builder[type] =
                            value;


                        $$(
                            `[data-choice="${type}"]`
                        ).forEach((item) => {

                            const selected =
                                item.dataset.value ===
                                value;


                            item.classList.toggle(
                                "choice-card--selected",
                                selected
                            );


                            item.setAttribute(
                                "aria-selected",
                                String(selected)
                            );
                        });


                        updateBuilderPreview();

                        saveState();
                    }
                );
            }
        );


        $$("#training-days .training-day")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const day =
                            button.dataset.day;


                        const exists =
                            state.builder.days.includes(
                                day
                            );


                        if (exists) {

                            state.builder.days =
                                state.builder.days.filter(
                                    (item) =>
                                        item !== day
                                );

                        } else {

                            state.builder.days.push(
                                day
                            );
                        }


                        button.classList.toggle(
                            "training-day--selected",
                            !exists
                        );


                        button.setAttribute(
                            "aria-pressed",
                            String(!exists)
                        );


                        updateBuilderPreview();

                        saveState();
                    }
                );
            });


        const generateButton =
            $("#generate-routine");


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateRoutine
            );
        }
    }


    function setBuilderStep(step) {

        if (
            step < 1 ||
            step > 4
        ) {
            return;
        }


        state.builder.step =
            step;


        $$(".builder-panel").forEach(
            (panel) => {

                panel.classList.toggle(
                    "builder-panel--active",
                    Number(
                        panel.dataset.builderPanel
                    ) === step
                );
            }
        );


        $$("[data-builder-step]").forEach(
            (button) => {

                button.classList.toggle(
                    "builder-step--active",
                    Number(
                        button.dataset.builderStep
                    ) === step
                );
            }
        );


        updateBuilderPreview();
    }


    function updateBuilderPreview() {

        const goalLabels = {

            muscle:
                "Ganar músculo",

            strength:
                "Ganar fuerza",

            fitness:
                "Condición física",

            "fat-loss":
                "Perder grasa"
        };


        const levelLabels = {

            beginner:
                "Principiante",

            intermediate:
                "Intermedio",

            advanced:
                "Avanzado"
        };


        const equipmentLabels = {

            gym:
                "Gimnasio",

            home:
                "Casa",

            bodyweight:
                "Peso corporal"
        };


        const goal =
            $("#preview-goal");


        const level =
            $("#preview-level");


        const days =
            $("#preview-days");


        const equipment =
            $("#preview-equipment");


        if (goal) {

            goal.textContent =
                goalLabels[
                    state.builder.goal
                ] || "—";
        }


        if (level) {

            level.textContent =
                levelLabels[
                    state.builder.level
                ] || "—";
        }


        if (days) {

            days.textContent =
                String(
                    state.builder.days.length
                );
        }


        if (equipment) {

            equipment.textContent =
                equipmentLabels[
                    state.builder.equipment
                ] || "—";
        }


        const weekPreview =
            $("#builder-week-preview");


        if (weekPreview) {

            weekPreview.textContent =
                state.builder.days.length

                    ? `${state.builder.days.length} días seleccionados para entrenar.`

                    : "Selecciona tus días para visualizar tu semana.";
        }


        const previewList =
            $("#routine-preview-list");


        if (!previewList) {
            return;
        }


        if (!state.builder.goal) {

            previewList.innerHTML = `

                <p class="muted">

                    Completa los pasos
                    para generar una propuesta.

                </p>

            `;

            return;
        }


        const previewExercises =
            getRecommendedExercises();


        previewList.innerHTML =
            previewExercises
                .slice(0, 5)
                .map(
                    (exercise) => `

                        <div class="mini-exercise">

                            <span>

                                ${escapeHtml(
                                    exercise.name
                                )}

                            </span>

                            <strong>

                                ${exercise.sets}
                                ×
                                ${exercise.reps}

                            </strong>

                        </div>

                    `
                )
                .join("");
    }


    function getRecommendedExercises() {

        let recommended =
            [...exercises];


        if (
            state.builder.goal ===
            "strength"
        ) {

            recommended.sort(
                (a, b) =>
                    Number(
                        b.weight > 50
                    ) -
                    Number(
                        a.weight > 50
                    )
            );
        }


        if (
            state.builder.goal ===
            "fitness"
        ) {

            recommended.sort(
                (a, b) =>
                    a.sets -
                    b.sets
            );
        }


        if (
            state.builder.equipment ===
            "bodyweight"
        ) {

            recommended =
                recommended.filter(
                    (exercise) =>
                        exercise.equipment ===
                        "Peso corporal"
                );
        }


        if (
            state.builder.equipment ===
            "home"
        ) {

            recommended =
                recommended.filter(
                    (exercise) =>
                        exercise.equipment ===
                        "Mancuernas" ||
                        exercise.equipment ===
                        "Peso corporal"
                );
        }


        return recommended.length
            ? recommended
            : exercises;
    }


    function generateRoutine() {

        if (!state.builder.goal) {

            showToast(
                "Selecciona tu objetivo primero."
            );

            setBuilderStep(1);

            return;
        }


        if (!state.builder.level) {

            showToast(
                "Selecciona tu nivel."
            );

            setBuilderStep(2);

            return;
        }


        if (!state.builder.days.length) {

            showToast(
                "Selecciona al menos un día."
            );

            setBuilderStep(3);

            return;
        }


        if (!state.builder.equipment) {

            showToast(
                "Selecciona tu equipo."
            );

            setBuilderStep(4);

            return;
        }


        const recommended =
            getRecommendedExercises();


        state.workout.exercises =
            recommended
                .slice(0, 5)
                .map(
                    (exercise) =>
                        exercise.id
                );


        state.workout.currentIndex =
            0;


        state.workout.completedSets =
            {};


        state.workout.completed =
            false;


        state.workout.weight =
            getCurrentWorkoutExercise()
                ?.weight || 80;


        saveState();

        renderWorkout();

        renderHome();


        showToast(
            "Tu nueva rutina está lista."
        );


        navigate(
            "workout"
        );
    }


    /* ======================================================================
       09. LIVE WORKOUT
       ====================================================================== */

    function initializeWorkout() {

        const startButton =
            $("#start-home-workout");


        if (startButton) {

            startButton.addEventListener(
                "click",
                () => navigate("workout")
            );
        }


        const increase =
            $("#increase-weight");


        const decrease =
            $("#decrease-weight");


        if (increase) {

            increase.addEventListener(
                "click",
                () =>
                    changeWeight(2.5)
            );
        }


        if (decrease) {

            decrease.addEventListener(
                "click",
                () =>
                    changeWeight(-2.5)
            );
        }


        const complete =
            $("#complete-set");


        if (complete) {

            complete.addEventListener(
                "click",
                completeCurrentSet
            );
        }


        const reset =
            $("#reset-rest-timer");


        if (reset) {

            reset.addEventListener(
                "click",
                resetRestTimer
            );
        }


        const finish =
            $("#finish-workout");


        if (finish) {

            finish.addEventListener(
                "click",
                finishWorkout
            );
        }
    }


    function renderWorkout() {

        const exercise =
            getCurrentWorkoutExercise();


        if (!exercise) {
            return;
        }


        const category =
            $("#live-exercise-category");


        const name =
            $("#live-exercise-name");


        const target =
            $("#live-exercise-target");


        const weight =
            $("#live-weight");


        const label =
            $("#workout-progress-label");


        const count =
            $("#workout-completed-count");


        if (category) {

            category.textContent =
                exercise.categoryLabel
                    .toUpperCase();
        }


        if (name) {

            name.textContent =
                exercise.name;
        }


        if (target) {

            target.textContent =
                `${exercise.sets} series × ${exercise.reps} reps`;
        }


        if (weight) {

            weight.textContent =
                formatWeight(
                    state.workout.weight
                );
        }


        if (label) {

            label.textContent =
                `Ejercicio ${
                    state.workout.currentIndex + 1
                } de ${
                    state.workout.exercises.length
                }`;
        }


        if (count) {

            const completedExercises =
                state.workout.exercises.filter(
                    (id, index) =>
                        isExerciseComplete(
                            getExercise(id),
                            index
                        )
                ).length;


            count.textContent =
                `${completedExercises} / ${
                    state.workout.exercises.length
                }`;
        }


        renderSets(exercise);

        renderWorkoutQueue();
    }


    function renderSets(exercise) {

        const grid =
            $("#live-set-grid");


        if (!grid) {
            return;
        }


        const completed =
            state.workout.completedSets[
                exercise.id
            ] || [];


        grid.innerHTML = "";


        for (
            let setNumber = 1;
            setNumber <= exercise.sets;
            setNumber++
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "set-button";


            if (
                completed.includes(
                    setNumber
                )
            ) {

                button.classList.add(
                    "set-button--complete"
                );
            }


            if (
                setNumber ===
                completed.length + 1 &&
                !completed.includes(
                    setNumber
                )
            ) {

                button.classList.add(
                    "set-button--active"
                );
            }


            button.innerHTML = `

                <strong>
                    Serie ${setNumber}
                </strong>

                <small>
                    ${exercise.reps} reps
                </small>

            `;


            button.addEventListener(
                "click",
                () =>
                    toggleSet(
                        exercise,
                        setNumber
                    )
            );


            grid.appendChild(
                button
            );
        }
    }


    function renderWorkoutQueue() {

        const list =
            $("#workout-queue-list");


        if (!list) {
            return;
        }


        list.innerHTML = "";


        state.workout.exercises.forEach(
            (id, index) => {

                const exercise =
                    getExercise(id);


                if (!exercise) {
                    return;
                }


                const complete =
                    isExerciseComplete(
                        exercise,
                        index
                    );


                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "queue-item";


                if (
                    index ===
                    state.workout.currentIndex
                ) {

                    item.classList.add(
                        "queue-item--active"
                    );
                }


                if (complete) {

                    item.classList.add(
                        "queue-item--complete"
                    );
                }


                item.innerHTML = `

                    <span class="queue-item__number">

                        ${
                            complete
                                ? "✓"
                                : index + 1
                        }

                    </span>


                    <span>

                        <span class="queue-item__name">

                            ${escapeHtml(
                                exercise.name
                            )}

                        </span>


                        <span class="queue-item__meta">

                            ${exercise.sets}
                            ×
                            ${exercise.reps}

                        </span>

                    </span>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        state.workout.currentIndex =
                            index;


                        state.workout.weight =
                            exercise.weight || 0;


                        saveState();

                        renderWorkout();
                    }
                );


                list.appendChild(
                    item
                );
            }
        );
    }


    function changeWeight(amount) {

        const exercise =
            getCurrentWorkoutExercise();


        if (!exercise) {
            return;
        }


        const newWeight =
            Math.max(
                0,
                Number(
                    state.workout.weight
                ) + amount
            );


        state.workout.weight =
            Math.round(
                newWeight * 10
            ) / 10;


        const display =
            $("#live-weight");


        if (display) {

            display.textContent =
                formatWeight(
                    state.workout.weight
                );
        }


        saveState();
    }


    function toggleSet(
        exercise,
        setNumber
    ) {

        const completed =
            state.workout.completedSets[
                exercise.id
            ] || [];


        if (
            completed.includes(
                setNumber
            )
        ) {

            state.workout.completedSets[
                exercise.id
            ] =
                completed.filter(
                    (set) =>
                        set !== setNumber
                );

        } else {

            state.workout.completedSets[
                exercise.id
            ] =
                [
                    ...completed,
                    setNumber
                ].sort(
                    (a, b) =>
                        a - b
                );
        }


        saveState();

        renderWorkout();

        renderHome();
    }


    function completeCurrentSet() {

        const exercise =
            getCurrentWorkoutExercise();


        if (!exercise) {
            return;
        }


        const completed =
            state.workout.completedSets[
                exercise.id
            ] || [];


        const nextSet =
            completed.length + 1;


        if (
            nextSet >
            exercise.sets
        ) {

            showToast(
                "Todas las series ya están completas."
            );

            return;
        }


        state.workout.completedSets[
            exercise.id
        ] =
            [
                ...completed,
                nextSet
            ];


        saveState();

        renderWorkout();

        renderHome();

        startRestTimer();


        if (
            state.workout.completedSets[
                exercise.id
            ].length >=
            exercise.sets
        ) {

            showToast(
                `${exercise.name} completado.`
            );


            moveToNextExercise();

        } else {

            showToast(
                `Serie ${nextSet} completada.`
            );
        }
    }


    function moveToNextExercise() {

        const nextIndex =
            state.workout.currentIndex + 1;


        if (
            nextIndex >=
            state.workout.exercises.length
        ) {

            state.workout.completed =
                true;


            saveState();


            showToast(
                "Entrenamiento completado. 🔥"
            );


            renderHome();

            return;
        }


        setTimeout(
            () => {

                state.workout.currentIndex =
                    nextIndex;


                const exercise =
                    getCurrentWorkoutExercise();


                state.workout.weight =
                    exercise?.weight || 0;


                saveState();

                renderWorkout();

            },
            450
        );
    }


    function finishWorkout() {

        const completed =
            state.workout.exercises.filter(
                (id, index) =>
                    isExerciseComplete(
                        getExercise(id),
                        index
                    )
            ).length;


        if (
            completed <
            state.workout.exercises.length
        ) {

            const confirmed =
                window.confirm(
                    `Has completado ${
                        completed
                    } de ${
                        state.workout.exercises.length
                    } ejercicios. ¿Quieres terminar?`
                );


            if (!confirmed) {
                return;
            }
        }


        state.workout.completed =
            true;


        stopRestTimer();

        saveState();

        renderHome();


        showToast(
            "Sesión guardada."
        );


        navigate(
            "home"
        );
    }


    /* ======================================================================
       10. REST TIMER
       ====================================================================== */

    function startRestTimer() {

        stopRestTimer();


        state.workout.restSeconds =
            90;


        state.workout.running =
            true;


        updateRestTimer();


        state.workout.timer =
            setInterval(
                () => {

                    state.workout.restSeconds--;

                    updateRestTimer();


                    if (
                        state.workout.restSeconds <=
                        0
                    ) {

                        stopRestTimer();


                        showToast(
                            "Descanso terminado. Vamos."
                        );
                    }

                },
                1000
            );
    }


    function stopRestTimer() {

        if (
            state.workout.timer
        ) {

            clearInterval(
                state.workout.timer
            );
        }


        state.workout.timer =
            null;


        state.workout.running =
            false;
    }


    function resetRestTimer() {

        stopRestTimer();


        state.workout.restSeconds =
            90;


        updateRestTimer();
    }


    function updateRestTimer() {

        const timer =
            $("#rest-timer");


        if (!timer) {
            return;
        }


        const minutes =
            Math.floor(
                state.workout.restSeconds /
                60
            );


        const seconds =
            state.workout.restSeconds %
            60;


        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }


    /* ======================================================================
       11. EXERCISE LIBRARY
       ====================================================================== */

    function initializeExerciseLibrary() {

        const search =
            $("#exercise-search");


        if (search) {

            search.addEventListener(
                "input",
                () => {

                    state.library.query =
                        search.value
                            .trim()
                            .toLowerCase();


                    renderExerciseLibrary();
                }
            );
        }


        $$("#exercise-filters .filter-tab")
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            state.library.filter =
                                button.dataset.filter;


                            $$(
                                "#exercise-filters .filter-tab"
                            )
                                .forEach(
                                    (item) => {

                                        item.classList.toggle(
                                            "filter-tab--active",
                                            item === button
                                        );
                                    }
                                );


                            renderExerciseLibrary();
                        }
                    );
                }
            );


        const library =
            $("#exercise-library");


        if (library) {

            library.addEventListener(
                "click",
                (event) => {

                    const detailsButton =
                        event.target.closest(
                            "[data-exercise-details]"
                        );


                    const addButton =
                        event.target.closest(
                            "[data-add-exercise]"
                        );


                    if (detailsButton) {

                        openExerciseDetails(
                            detailsButton.dataset
                                .exerciseDetails
                        );
                    }


                    if (addButton) {

                        addExerciseToWorkout(
                            addButton.dataset
                                .addExercise
                        );
                    }
                }
            );
        }


        const addFromModal =
            $("#modal-add-exercise");


        if (addFromModal) {

            addFromModal.addEventListener(
                "click",
                () => {

                    const exerciseId =
                        addFromModal.dataset
                            .exerciseId;


                    if (exerciseId) {

                        addExerciseToWorkout(
                            exerciseId
                        );


                        closeModal(
                            "exercise-modal"
                        );
                    }
                }
            );
        }
    }


    function renderExerciseLibrary() {

        const library =
            $("#exercise-library");


        const empty =
            $("#exercise-empty-state");


        if (!library) {
            return;
        }


        const filtered =
            exercises.filter(
                (exercise) => {

                    const matchesCategory =
                        state.library.filter ===
                        "all" ||
                        exercise.category ===
                        state.library.filter;


                    const searchable =
                        `${exercise.name} ${exercise.categoryLabel} ${exercise.equipment}`
                            .toLowerCase();


                    const matchesSearch =
                        !state.library.query ||
                        searchable.includes(
                            state.library.query
                        );


                    return (
                        matchesCategory &&
                        matchesSearch
                    );
                }
            );


        library.innerHTML =
            "";


        if (!filtered.length) {

            if (empty) {
                empty.hidden = false;
            }

            return;
        }


        if (empty) {
            empty.hidden = true;
        }


        filtered.forEach(
            (exercise) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "exercise-library-card";


                card.dataset.category =
                    exercise.category;


                card.innerHTML = `

                    <div
                        class="exercise-library-card__media"
                    >
                        <span>🏋️</span>
                    </div>


                    <div
                        class="exercise-library-card__body"
                    >

                        <span class="eyebrow">

                            ${escapeHtml(
                                exercise.categoryLabel
                            ).toUpperCase()}

                        </span>


                        <h2
                            class="exercise-library-card__title"
                        >

                            ${escapeHtml(
                                exercise.name
                            )}

                        </h2>


                        <p class="muted">

                            ${escapeHtml(
                                exercise.description
                            )}

                        </p>


                        <div
                            class="exercise-library-card__meta"
                        >

                            <span>

                                ${escapeHtml(
                                    exercise.equipment
                                )}

                            </span>


                            <span>

                                ${escapeHtml(
                                    exercise.level
                                )}

                            </span>

                        </div>


                        <div class="button-group">

                            <button
                                type="button"
                                class="button button--ghost"
                                data-exercise-details="${exercise.id}"
                            >

                                Ver detalles

                            </button>


                            <button
                                type="button"
                                class="button button--primary"
                                data-add-exercise="${exercise.id}"
                            >

                                ＋ Añadir

                            </button>

                        </div>

                    </div>

                `;


                library.appendChild(
                    card
                );
            }
        );
    }


    let selectedExerciseId =
        null;


    function openExerciseDetails(id) {

        const exercise =
            getExercise(id);


        if (!exercise) {
            return;
        }


        selectedExerciseId =
            id;


        const category =
            $("#exercise-modal-category");


        const title =
            $("#exercise-modal-title");


        const addButton =
            $("#modal-add-exercise");


        if (category) {

            category.textContent =
                exercise.categoryLabel
                    .toUpperCase();
        }


        if (title) {

            title.textContent =
                exercise.name;
        }


        if (addButton) {

            addButton.dataset.exerciseId =
                exercise.id;
        }


        openModal(
            "exercise-modal"
        );
    }


    function addExerciseToWorkout(id) {

        const exercise =
            getExercise(id);


        if (!exercise) {
            return;
        }


        if (
            state.workout.exercises
                .includes(id)
        ) {

            showToast(
                `${exercise.name} ya está en tu rutina.`
            );

            return;
        }


        state.workout.exercises.push(
            id
        );


        saveState();

        renderHome();

        renderWorkout();


        showToast(
            `${exercise.name} añadido a tu rutina.`
        );
    }


    /* ======================================================================
       12. PROGRESS
       ====================================================================== */

    function initializeProgress() {

        const select =
            $("#progress-period");


        if (!select) {
            return;
        }


        select.value =
            state.progress.period;


        select.addEventListener(
            "change",
            () => {

                state.progress.period =
                    select.value;


                saveState();

                renderProgress();
            }
        );
    }


    function renderProgress() {

        const select =
            $("#progress-period");


        const label =
            $("#chart-period-label");


        if (select) {

            select.value =
                state.progress.period;
        }


        if (label) {

            const labels = {

                "8-weeks":
                    "Últimas 8 semanas",

                "6-months":
                    "Últimos 6 meses",

                "1-year":
                    "Último año"
            };


            label.textContent =
                labels[
                    state.progress.period
                ];
        }


        renderChart();
    }


    function renderChart() {

        const chart =
            $("#progress-chart");


        if (!chart) {
            return;
        }


        const values =
            state.progress.period ===
            "1-year"

                ? [
                    35, 41, 44, 47,
                    52, 56, 60, 63,
                    66, 70, 75, 81
                ]

                : state.progress.period ===
                    "6-months"

                    ? [
                        42, 49, 46, 58,
                        61, 67, 72, 78
                    ]

                    : [
                        45, 51, 49, 58,
                        63, 67, 73, 82
                    ];


        const labels =
            state.progress.period ===
            "1-year"

                ? [
                    "Sep", "Oct", "Nov",
                    "Dic", "Ene", "Feb",
                    "Mar", "Abr", "May",
                    "Jun", "Jul", "Ago"
                ]

                : [
                    "S1", "S2", "S3", "S4",
                    "S5", "S6", "S7", "S8"
                ];


        chart.innerHTML =
            "";


        const max =
            Math.max(
                ...values
            );


        values.forEach(
            (value, index) => {

                const bar =
                    document.createElement(
                        "button"
                    );


                bar.type =
                    "button";


                bar.className =
                    "chart-bar";


                bar.style.setProperty(
                    "--bar-height",
                    `${Math.max(
                        12,
                        (value / max) *
                        100
                    )}%`
                );


                bar.setAttribute(
                    "aria-label",
                    `${labels[index]}: ${
                        value * 100
                    } kg`
                );


                bar.innerHTML = `

                    <span>
                        ${labels[index]}
                    </span>

                `;


                bar.addEventListener(
                    "click",
                    () => {

                        const selected =
                            $("#chart-selected-value");


                        if (selected) {

                            selected.textContent =
                                `${
                                    (
                                        value * 100
                                    ).toLocaleString(
                                        "es-MX"
                                    )
                                } kg`;
                        }
                    }
                );


                chart.appendChild(
                    bar
                );
            }
        );
    }


    /* ======================================================================
       13. AI COACH
       ====================================================================== */

    function initializeCoach() {

        const openButtons = [

            "#home-coach-button",

            "#mobile-coach-button",

            "#coach-insight-button"
        ];


        openButtons.forEach(
            (selector) => {

                const button =
                    $(selector);


                if (button) {

                    button.addEventListener(
                        "click",
                        () =>
                            openModal(
                                "coach-modal"
                            )
                    );
                }
            }
        );


        $$(".suggestion-chip")
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const prompt =
                                button.dataset
                                    .coachPrompt;


                            if (prompt) {

                                sendCoachMessage(
                                    prompt
                                );
                            }
                        }
                    );
                }
            );


        const form =
            $("#coach-form");


        if (form) {

            form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();


                    const input =
                        $("#coach-input");


                    if (!input) {
                        return;
                    }


                    const message =
                        input.value.trim();


                    if (!message) {
                        return;
                    }


                    input.value =
                        "";


                    sendCoachMessage(
                        message
                    );
                }
            );
        }
    }


    function sendCoachMessage(message) {

        addCoachMessage(
            message,
            "user"
        );


        setTimeout(
            () => {

                const response =
                    generateCoachResponse(
                        message
                    );


                addCoachMessage(
                    response,
                    "coach"
                );

            },
            450
        );
    }


    function addCoachMessage(
        message,
        type
    ) {

        const container =
            $("#coach-messages");


        if (!container) {
            return;
        }


        const article =
            document.createElement(
                "article"
            );


        article.className =
            `chat-message chat-message--${type}`;


        article.innerHTML = `

            <div class="chat-message__avatar">

                ${
                    type === "coach"
                        ? "✦"
                        : "M"
                }

            </div>


            <div class="chat-message__body">

                <p>

                    ${escapeHtml(
                        message
                    )}

                </p>

            </div>

        `;


        container.appendChild(
            article
        );


        container.scrollTo({
            top:
                container.scrollHeight,

            behavior:
                "smooth"
        });
    }


    function generateCoachResponse(
        message
    ) {

        const text =
            message.toLowerCase();


        if (
            text.includes("peso") ||
            text.includes("kg")
        ) {

            return (
                "Usa un peso que te permita completar las repeticiones con técnica sólida y aproximadamente 1–3 repeticiones en reserva. Si la última serie se siente demasiado fácil, podemos subir ligeramente."
            );
        }


        if (
            text.includes("cansado") ||
            text.includes("fatiga")
        ) {

            return (
                "Si hoy estás fatigado, prioriza técnica y reduce un poco la carga si tu rendimiento cae. No necesitas forzar un PR en cada sesión."
            );
        }


        if (
            text.includes("técnica") ||
            text.includes("tecnica")
        ) {

            return (
                "Concéntrate primero en controlar la fase excéntrica, mantener una posición estable y usar un rango de movimiento que puedas repetir con consistencia."
            );
        }


        if (
            text.includes("progreso") ||
            text.includes("mejor")
        ) {

            return (
                "Tu progreso se ve mejor cuando observamos varias semanas, no una sola sesión. Busca una tendencia positiva en repeticiones, carga, volumen o calidad técnica."
            );
        }


        return (
            "Puedo ayudarte a interpretar tu entrenamiento, ajustar carga, entender tu progreso o decidir cómo afrontar la sesión de hoy."
        );
    }


    /* ======================================================================
       14. PROFILE
       ====================================================================== */

    function initializeProfile() {

        [
            "#profile-button",
            "#mobile-profile-button"

        ].forEach(
            (selector) => {

                const button =
                    $(selector);


                if (button) {

                    button.addEventListener(
                        "click",
                        () => {

                            showToast(
                                "Perfil de Manuel — próximamente."
                            );
                        }
                    );
                }
            }
        );
    }


    /* ======================================================================
       15. UTILITIES
       ====================================================================== */

    function formatWeight(value) {

        const number =
            Number(value) || 0;


        return Number.isInteger(
            number
        )

            ? String(number)

            : number.toFixed(1);
    }


    function escapeHtml(value) {

        return String(value)

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /* ======================================================================
       16. INITIALIZATION
       ====================================================================== */

    function initialize() {

        loadState();

        initializeNavigation();

        initializeModals();

        initializeBuilder();

        initializeWorkout();

        initializeExerciseLibrary();

        initializeProgress();

        initializeCoach();

        initializeProfile();


        renderHome();

        renderBuilder();

        renderWorkout();

        renderProgress();

        renderExerciseLibrary();


        updateRestTimer();


        const initialView =
            window.location.hash.replace(
                "#",
                ""
            );


        navigate(
            initialView || "home"
        );


        console.log(
            "RepUp listo. HTML + CSS + JavaScript conectados."
        );
    }


    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

})();