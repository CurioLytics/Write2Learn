sequenceDiagram
    title Flashcard Review Flow (FSRS-based)

    actor User as 👤 User
    participant App as 🧠 Vocabulary App
    participant FSRS as 🧮 FSRS Engine
    participant DB as 💾 Database (Supabase)

    %% Start review session
    User ->> App: Select vocabulary set
    App ->> DB: Get words in selected set
    DB -->> App: Return vocabulary list

    %% Retrieve due cards
    App ->> FSRS: Request due flashcards
    FSRS -->> App: Return due cards list
    App ->> User: Display first flashcard

    loop For each flashcard
        User ->> App: View and rate card (Easy/Good/Hard/Again)
        App ->> FSRS: Update review rating & compute next review time
        FSRS -->> App: Return next review interval
        App ->> DB: Save review log and updated schedule
        DB -->> App: Confirm saved
        App ->> User: Show next card
    end

    App ->> User: Notify session completed
    Note right of App: All card review data stored\nNext review time computed per FSRS model
