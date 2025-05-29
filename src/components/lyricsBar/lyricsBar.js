import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";

const LyricsBar = ({ currentLyrics }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [selectedLang, setSelectedLang] = useState("zh");

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

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
    { code: "zh", label: "Chinese" },
    { code: "es", label: "Spanish" },
  ];

  useEffect(() => {
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        setTranslatedLyrics([]);
        return;
      }
      const translated = await Promise.all(
        currentLyrics.map(async ([timestamp, line]) => {
          const translatedLine = await translateText(line, selectedLang);
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    translateLyrics();
  }, [currentLyrics, selectedLang]);

  return (
    <div className={styles.lyricsBar}>
      <div className={styles.languageSelector}>
        <label htmlFor="language-select">Translate to: </label>
        <select
          id="language-select"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
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
