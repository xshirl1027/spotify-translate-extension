import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({ currentLyrics }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [language, setLanguage] = useState("");

  useEffect(() => {
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        setTranslatedLyrics([]);
        return;
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
  }, [currentLyrics, language]);

  if (!translatedLyrics || translatedLyrics.length === 0) {
    return <></>;
  }

  return (
    <div className={styles.lyricsBar}>
      <div className={styles.languageSelector}>
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
          {/* Add more languages as needed */}
        </select>
      </div>
      {!translatedLyrics || translatedLyrics.length < 2 ? (
        <p>{line !== "" ? decodeHtmlEntities(line) : "♪ ... ♪"}</p>
      ) : (
        translatedLyrics.slice(0, -1).map(([timestamp, line], idx) => (
          <div key={timestamp || idx} className={styles.lyricsLine}>
            <p>{line !== "" ? decodeHtmlEntities(line) : "♪ ... ♪"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default LyricsBar;
