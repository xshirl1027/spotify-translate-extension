import React, { use, useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({
  currentLyrics = null,
  plainLyrics = null,
  track = null,
}) => {
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
      // Combine all lines into a single string separated by a unique delimiter
      const lines = lyrics.map(([_, line]) => line || "");
      const delimiter = "*";
      const combined = lines.join(delimiter);
      const translatedCombined = await translateText(combined, language);
      // Split the translated string back into lines using the delimiter
      const translatedLines = translatedCombined.split(delimiter);
      // Map back to [timestamp, translatedLine]
      const translated = lyrics.map(([timestamp], idx) => [
        timestamp,
        translatedLines[idx] || "",
      ]);
      setTranslatedLyrics(translated);
    };
    if (language != "") {
      translateLyrics(currentLyrics || plainLyrics);
    } else {
      setTranslatedLyrics(currentLyrics || plainLyrics);
    }
  }, [currentLyrics, language, plainLyrics]);

  // if (track && (currentLyrics == null || currentLyrics.length === 0)) {
  //   return (
  //     <>
  //       <p className={styles.noLyrics}>
  //         ♪ sorry, the lyrics database is currently down. please come back
  //         later! ♪
  //       </p>
  //     </>
  //   );
  // }
  // if (!track && (currentLyrics == null || currentLyrics.length === 0)) {
  //   return (
  //     <>
  //       <p className={styles.noLyrics}>♪ ... ♪</p>
  //     </>
  //   );
  // }

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
            <option value="es">Spanish</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="hi">Hindi</option>
            <option value="vi">Vietnamese</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
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
