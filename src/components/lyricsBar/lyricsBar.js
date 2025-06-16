import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({ currentLyrics = null, plainLyrics = null }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [translatedPlainLyrics, setTranslatedPlainLyrics] = useState(null);
  const [language, setLanguage] = useState("en");
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!currentLyrics || currentLyrics.length === 0) {
      if (!plainLyrics || plainLyrics.length === 0) {
        setTranslatedLyrics([]);
        return;
      }
    }
    // if (plainLyrics && plainLyrics.length > 0) {
    //   currentLyrics = plainLyrics.split("/n").map((line) => [null, line]);
    // }
    const translateLyrics = async (lyrics) => {
      const translated = await Promise.all(
        lyrics.map(async ([timestamp, line]) => {
          if (!line || line == "") return [timestamp, line];
          const translatedLine = await translateText(line, language);
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    if (language != "") {
      translateLyrics(currentLyrics || plainLyrics);
    } else {
      setTranslatedLyrics(currentLyrics || plainLyrics);
    }
  }, [currentLyrics, language, plainLyrics]);

  // useEffect(async () => {
  //   if (!currentLyrics || currentLyrics.length === 0) {
  //     if (!plainLyrics || plainLyrics.length === 0) {
  //       setTranslatedLyrics([]);
  //       setTranslatedLyricsPlain(null);
  //       return;
  //     }
  //   }
  //   if (plainLyrics && plainLyrics.length > 0) {
  //     const translated = await translateText(plainLyrics, language);
  //     setTranslatedPlainLyrics(translated);
  //   }
  // }, [plainLyrics, language]);

  if (currentLyrics == null || currentLyrics.length === 0) {
    if (!plainLyrics || plainLyrics.length === 0) {
      return <p className={styles.noLyrics}> ... </p>;
    }
  }

  return (
    <div className={`${styles.lyricsBar} ${minimized ? styles.minimized : ""}`}>
      <div
        className={styles.lyricsBarHeader}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          className={styles.languageSelector}
          style={{ display: "flex", alignItems: "center" }}
        >
          <label htmlFor="language-select" style={{ marginRight: "8px" }}>
            Language:{" "}
          </label>
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
          {translatedLyrics &&
            translatedLyrics.length > 0 &&
            translatedLyrics.map(([timestamp, line], idx) => (
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
