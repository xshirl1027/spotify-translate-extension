import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";

const LyricsBar = ({ currentLyrics }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);

  useEffect(() => {
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        setTranslatedLyrics([]);
        return;
      }
      const translated = await Promise.all(
        currentLyrics.map(async ([timestamp, line]) => {
          const translatedLine = await translateText(line, "zh");
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    translateLyrics();
  }, [currentLyrics]);

  if (!translatedLyrics || translatedLyrics.length === 0) {
    return <></>;
  }

  const [language, setLanguage] = useState("en");

  return (
    <div className={styles.lyricsBar}>
      <div className={styles.languageSelector}>
        <label htmlFor="language-select">Language: </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
          {/* Add more languages as needed */}
        </select>
      </div>
      {translatedLyrics.map(([timestamp, line], idx) => (
        <div key={timestamp || idx} className={styles.lyricsLine}>
          <p>{line !== "" ? line : "♪  ... ♪"}</p>
        </div>
      ))}
    </div>
  );
};

export default LyricsBar;
