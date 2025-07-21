import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({
  currentLyrics = null,
  plainLyrics = null,
  refreshCurrentLyrics = () => {},
}) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [language, setLanguage] = useState("en");
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let lyricsToTranslate = [];
    if (!currentLyrics && plainLyrics && plainLyrics.length > 0) {
      console.log("Using plain lyrics as fallback");
      console.log(plainLyrics);
      lyricsToTranslate = plainLyrics.split("\n").map((line) => [null, line]);
      // Add an empty line at the end for spacing
      lyricsToTranslate.push([null, ""]);
    }
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        if (!plainLyrics || plainLyrics.length === 0) {
          setTranslatedLyrics([]);
          return;
        }
      }
      let lyricsToTranslate = currentLyrics;
      if (
        currentLyrics &&
        currentLyrics?.length > 0 &&
        !Array.isArray(currentLyrics[0])
      )
        lyricsToTranslate = currentLyrics;
      if (currentLyrics == null && plainLyrics && plainLyrics.length > 0) {
        lyricsToTranslate = [
          [null, plainLyrics],
          [null, null],
        ];
      }
      const translated = await Promise.all(
        lyricsToTranslate.map(async ([timestamp, line]) => {
          if (!line || line === "") return [timestamp, line];
          const translatedLine = await translateText(line, language);
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    if (language != "") {
      translateLyrics();
    } else {
      if (currentLyrics) setTranslatedLyrics(currentLyrics);
      if (!currentLyrics && plainLyrics) setTranslatedLyrics(lyricsToTranslate);
    }
  }, [currentLyrics, language, plainLyrics]);

  if (!currentLyrics || currentLyrics.length === 0) {
    if (!plainLyrics || plainLyrics.length === 0) {
      return <p className={styles.noLyrics}>No lyrics available</p>;
    }
  }

  return (
    <>
      <div
        className={styles.lyricsBarHeader}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1em",
          width: "100%",
          position: "sticky",
          top: "0",
          background: "rgb(40 51 120 / 39%)",
          padding: "9px",
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
          </select>
        </div>
        <button
          className={styles.refreshButton}
          onClick={refreshCurrentLyrics}
          aria-label="Refresh lyrics"
        >
          🔃 refresh
        </button>
        <button
          className={styles.minimizeButton}
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "Restore lyrics" : "Minimize lyrics"}
        >
          {minimized ? "🔼 restore" : "🔽 minimize"}
        </button>
      </div>
      <div
        className={`${styles.lyricsBar} ${minimized ? styles.minimized : ""}`}
        style={{
          maxHeight: "50vh",
          overflowY: "auto",
          background: "rgb(9 9 25 / 80%)",
        }}
      >
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
    </>
  );
};

export default LyricsBar;
