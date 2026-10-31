import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import {
  api,
  type Profile,
  type Specialization,
  type SpecializationChoice,
  type UserProfile,
} from "./api";

type AuthMode = "login" | "register";

const emptyProfile: Profile = {
  first_name: "",
  specialization: null,
  specialization_display: "",
  bio: "",
  fee: "",
};

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [specializations, setSpecializations] = useState<
    SpecializationChoice[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function initialize() {
      try {
        const choices = await api.getSpecializations();
        setSpecializations(choices);
      } catch {
        setSpecializations([
          { value: "vocals", label: "Вокал" },
          { value: "guitar", label: "Гитара" },
          { value: "bass", label: "Бас-гитара" },
          { value: "drums", label: "Ударные" },
          { value: "keys", label: "Клавишные" },
          { value: "other", label: "Другое" },
        ]);
      }

      try {
        const currentUser = await api.getProfile();
        setUser(currentUser);
        setProfile(currentUser.profile ?? emptyProfile);
      } catch {
        // Если пользователь не авторизован, показываем главную страницу.
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, []);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (mode === "register") {
        await api.register(username, password);
        setMessage("Регистрация выполнена. Теперь войдите в аккаунт.");
        setMode("login");
        setPassword("");
      } else {
        await api.login(username, password);
        const currentUser = await api.getProfile();
        setUser(currentUser);
        setProfile(currentUser.profile ?? emptyProfile);
        setMessage("Вы успешно вошли в аккаунт.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось выполнить запрос. Попробуйте ещё раз.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setBusy(true);

    try {
      await api.logout();
    } catch {
      // Даже если сервер вернул ошибку, возвращаемся к форме входа.
    } finally {
      setUser(null);
      setProfile(emptyProfile);
      setEditing(false);
      setPassword("");
      setBusy(false);
      setMessage("Вы вышли из аккаунта.");
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const updatedUser = await api.updateProfile({
        first_name: profile.first_name,
        specialization: profile.specialization,
        bio: profile.bio,
        fee: profile.fee === "" ? null : Number(profile.fee),
      });

      setUser(updatedUser);
      setProfile(updatedUser.profile ?? profile);
      setEditing(false);
      setMessage("Профиль успешно сохранён.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось сохранить профиль.",
      );
    } finally {
      setBusy(false);
    }
  }

  function updateProfile<K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) {
    setProfile((previous) => ({ ...previous, [key]: value }));
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <p>AFTERGLOW загружается...</p>
      </main>
    );
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="logo" href="#home">
          <span className="logo-symbol">A</span>
          <span>AFTERGLOW</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Главная</a>
          <a href="#about">О группе</a>
          <a href="#music">Музыка</a>
          <a href="#account">{user ? "Профиль" : "Войти"}</a>
        </nav>

        {user ? (
          <button
            className="button button-outline nav-button"
            onClick={handleLogout}
            disabled={busy}
          >
            Выйти
          </button>
        ) : (
          <a className="button button-outline nav-button" href="#account">
            Присоединиться
          </a>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              МУЗЫКА, КОТОРАЯ ОСТАЁТСЯ
            </div>

            <h1>
              FIND YOUR
              <br />
              <span>AFTERGLOW.</span>
            </h1>

            <p className="hero-description">
              Мы создаём музыку для тех моментов, которые хочется
              сохранить навсегда.
            </p>

            <div className="hero-actions">
              <a href="#music" className="button button-primary">
                Исследовать музыку <span>↗</span>
              </a>
              <a href="#about" className="button button-text">
                О нашей группе ↓
              </a>
            </div>

            <div className="hero-bottom">
              <div>
                <span className="mini-label">НАШ ЗВУК</span>
                <p>Alternative · Indie · Rock</p>
              </div>
              <div className="sound-wave" aria-label="Музыкальная волна">
                {Array.from({ length: 28 }, (_, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${12 + ((index * 17 + 13) % 36)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hero-art" aria-label="Абстрактная музыкальная композиция">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-orbit orbit-three" />
            <div className="art-core">
              <span>AFTER</span>
              <strong>GLOW</strong>
            </div>
            <div className="art-tag tag-top">FEEL THE SOUND</div>
            <div className="art-tag tag-bottom">EST. 2026</div>
          </div>
        </section>

        <section className="about-section section" id="about">
          <div className="section-heading">
            <span className="section-number">01 / О ГРУППЕ</span>
            <h2>
              Больше, чем
              <br />
              просто <span>звук.</span>
            </h2>
          </div>

          <div className="about-content">
            <p>
              AFTERGLOW — музыкальный проект, объединяющий разные
              инструменты, характеры и идеи. Мы верим, что у каждой
              мелодии есть своя история.
            </p>
            <p>
              Наша цель — создавать атмосферу, в которой каждый может
              найти что-то своё: энергию, спокойствие или вдохновение.
            </p>
            <a href="#account" className="text-link">
              Стань частью музыкального сообщества ↗
            </a>
          </div>
        </section>

        <section className="music-section section" id="music">
          <div className="section-heading">
            <span className="section-number">02 / НАШ МИР</span>
            <h2>
              Почувствуй
              <br />
              <span>ритм.</span>
            </h2>
          </div>

          <div className="music-grid">
            <article className="music-card music-card-one">
              <div className="card-top">
                <span>01 — ATMOSPHERE</span>
                <span>✳</span>
              </div>
              <div className="album-art album-purple">
                <div className="album-circle" />
                <div className="album-line" />
              </div>
              <h3>Midnight Echoes</h3>
              <p>Звуки ночного города</p>
              <span className="coming-soon">СКОРО</span>
            </article>

            <article className="music-card music-card-two">
              <div className="card-top">
                <span>02 — ENERGY</span>
                <span>✳</span>
              </div>
              <div className="album-art album-blue">
                <div className="album-circle" />
                <div className="album-line" />
              </div>
              <h3>Electric Dreams</h3>
              <p>Энергия новых идей</p>
              <span className="coming-soon">СКОРО</span>
            </article>

            <article className="music-card music-card-three">
              <div className="card-top">
                <span>03 — FEELINGS</span>
                <span>✳</span>
              </div>
              <div className="album-art album-pink">
                <div className="album-circle" />
                <div className="album-line" />
              </div>
              <h3>After the Rain</h3>
              <p>Истории после дождя</p>
              <span className="coming-soon">СКОРО</span>
            </article>
          </div>
        </section>

        <section className="account-section section" id="account">
          <div className="account-intro">
            <span className="section-number">03 / ЛИЧНЫЙ КАБИНЕТ</span>
            <h2>
              Твоя музыка.
              <br />
              Твой <span>профиль.</span>
            </h2>
            <p>
              Зарегистрируйся или войди, чтобы заполнить профиль музыканта
              и рассказать о себе.
            </p>

            <div className="account-feature">
              <span>✳</span>
              <div>
                <strong>Твой музыкальный профиль</strong>
                <p>Имя, специализация, описание и стоимость выступления.</p>
              </div>
            </div>
          </div>

          <div className="account-panel">
            {message && <div className="notice success">{message}</div>}
            {error && <div className="notice error">{error}</div>}

            {user ? (
              <div className="profile-view">
                <div className="profile-heading">
                  <div className="profile-avatar">
                    {(profile.first_name || user.username)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <span className="mini-label">ТВОЙ АККАУНТ</span>
                    <h3>{profile.first_name || user.username}</h3>
                    <p>@{user.username}</p>
                  </div>
                </div>

                {editing ? (
                  <form onSubmit={handleProfileSave} className="form">
                    <label>
                      Имя
                      <input
                        value={profile.first_name}
                        onChange={(event) =>
                          updateProfile("first_name", event.target.value)
                        }
                        placeholder="Как тебя зовут?"
                      />
                    </label>

                    <label>
                      Специализация
                      <select
                        value={profile.specialization ?? ""}
                        onChange={(event) =>
                          updateProfile(
                            "specialization",
                            (event.target.value || null) as Specialization | null,
                          )
                        }
                      >
                        <option value="">Выбери специализацию</option>
                        {specializations.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      О себе
                      <textarea
                        value={profile.bio}
                        onChange={(event) =>
                          updateProfile("bio", event.target.value)
                        }
                        placeholder="Расскажи о своём музыкальном опыте"
                        rows={4}
                      />
                    </label>

                    <label>
                      Стоимость выступления
                      <input
                        type="number"
                        min="0"
                        value={profile.fee ?? ""}
                        onChange={(event) =>
                          updateProfile("fee", event.target.value)
                        }
                        placeholder="Например, 5000"
                      />
                    </label>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="button button-primary full-button"
                        disabled={busy}
                      >
                        {busy ? "Сохраняем..." : "Сохранить профиль"}
                      </button>
                      <button
                        type="button"
                        className="button button-outline full-button"
                        onClick={() => {
                          setProfile(user.profile ?? emptyProfile);
                          setEditing(false);
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-details">
                    <div className="detail-row">
                      <span>Имя</span>
                      <strong>{profile.first_name || "Не указано"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Специализация</span>
                      <strong>
                        {profile.specialization_display || "Не указана"}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>О себе</span>
                      <strong>{profile.bio || "Пока нет описания"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Стоимость</span>
                      <strong>
                        {profile.fee !== null && profile.fee !== ""
                          ? `${profile.fee}`
                          : "Не указана"}
                      </strong>
                    </div>

                    <button
                      className="button button-primary full-button"
                      onClick={() => setEditing(true)}
                    >
                      Редактировать профиль ↗
                    </button>
                    <button
                      className="button button-outline full-button"
                      onClick={handleLogout}
                      disabled={busy}
                    >
                      {busy ? "Выходим..." : "Выйти из аккаунта"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="auth-tabs">
                  <button
                    className={mode === "login" ? "auth-tab active" : "auth-tab"}
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Вход
                  </button>
                  <button
                    className={
                      mode === "register" ? "auth-tab active" : "auth-tab"
                    }
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Регистрация
                  </button>
                </div>

                <div className="form-heading">
                  <h3>
                    {mode === "login" ? "С возвращением." : "Создай аккаунт."}
                  </h3>
                  <p>
                    {mode === "login"
                      ? "Введи данные, чтобы войти в свой аккаунт."
                      : "Зарегистрируйся и создай профиль музыканта."}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="form">
                  <label>
                    Имя пользователя
                    <input
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Твой логин"
                      required
                    />
                  </label>

                  <label>
                    Пароль
                    <input
                      type="password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Твой пароль"
                      minLength={1}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="button button-primary full-button"
                    disabled={busy}
                  >
                    {busy
                      ? "Пожалуйста, подожди..."
                      : mode === "login"
                        ? "Войти в аккаунт ↗"
                        : "Создать аккаунт ↗"}
                  </button>
                </form>

                <p className="form-footnote">
                  Данные отправляются на сервер преподавателя.
                </p>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#home">
          <span className="logo-symbol">A</span>
          <span>AFTERGLOW</span>
        </a>
        <p>Музыка объединяет.</p>
        <span>© 2026 AFTERGLOW</span>
      </footer>
    </div>
  );
}

export default App;