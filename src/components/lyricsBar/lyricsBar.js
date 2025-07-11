import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({ currentLyrics = null, plainLyrics = null }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [language, setLanguage] = useState("en");
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        if (!plainLyrics || plainLyrics.length === 0) {
          setTranslatedLyrics([]);
          return;
        }
      }
      if (plainLyrics && plainLyrics.length > 0) {
        currentLyrics = [null, plainLyrics];
      }
      const translated = await Promise.all(
        currentLyrics.map(async ([timestamp, line]) => {
          if (!line || line == "") return [timestamp, line];
          const translatedLine = await translateText(line, language);
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    if (language != "") {
      translateLyrics();
    } else {
      setTranslatedLyrics(currentLyrics);
    }
  }, [currentLyrics, language, plainLyrics]);

  if (!currentLyrics || currentLyrics.length === 0) {
    if (!plainLyrics || plainLyrics.length === 0) {
      return <p className={styles.noLyrics}>No lyrics available</p>;
    }
  }

  return (
    <div className={`${styles.lyricsBar} ${minimized ? styles.minimized : ""}`}>
      <div
        className={styles.lyricsBarHeader}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // Center horizontally
          gap: "1em", // Add some space between language selector and button
          width: "100%",
        }}
      >
        <div
          className={styles.languageSelector}
          style={{ display: "flex", alignItems: "center" }}
        >
          <label htmlFor="language-select">Language: </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Original</option>
            <option value="fr">French</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="hi">Hindi</option>
            <option value="ru">Russian</option>
            <option value="vi">Vietnamese</option>
            <option value="pl">Polish</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <button
          className={styles.minimizeButton}
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "Restore lyrics" : "Minimize lyrics"}
        >
          {minimized ? "🔼 Restore" : "🔽 Minimize"}
        </button>
      </div>
      {!minimized && (
        <>
          <p>♪ ... ♪</p>
          {translatedLyrics.slice(0, -1).map(([timestamp, line], idx) => (
            <div key={timestamp || idx} className={styles.lyricsLine}>
              <p>{line !== "" ? decodeHtmlEntities(line) : ""}</p>
            </div>
          ))}
          <p>♪ ... ♪</p>
        </>
      )}
    </div>
  );
};

export default LyricsBar;
