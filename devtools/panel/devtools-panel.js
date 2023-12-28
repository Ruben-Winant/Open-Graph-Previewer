/**
 * @param {string} fullUrl
 * @returns {string}
 */
const getBaseUrl = (fullUrl) => {
  if (undefined === fullUrl) {
    return undefined;
  }

  const url = new URL(fullUrl);
  let hostname = url.hostname;

  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  return hostname;
};

/**
 * @param {string[]} elementsToHide - An array of strings representing the IDs of the elements to be hidden.
 * @param {string} previewBlock - The ID of the HTML element where the insufficient data message will be displayed.
 * @param {string} [insufficientMessage="Insufficient data found."] - The message to be displayed when there is insufficient data.
 */
const hideElements = (
  elementsToHide,
  previewBlock,
  insufficientMessage = "Insufficient data found."
) => {
  elementsToHide.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  });

  const previewElement = document.getElementById(previewBlock);
  if (previewElement) {
    previewElement.textContent = insufficientMessage;
  }
};

/**
 * @param {Object} tags - An object containing key-value pairs representing the tags.
 * @param {Array} recommendedTags - An array of strings representing the recommended tags.
 * @param {HTMLElement} recommendedBlock - The HTML element where the recommended tags will be displayed.
 * @returns {boolean} - `true` if at least one recommended tag is missing from the `tags` object, `false` otherwise.
 */
const handleRecommendations = (tags, recommendedTags, recommendedBlock) => {
  const recoms = recommendedBlock.querySelector("ul");
  let recomsFound = false;

  recoms.innerHTML = "";

  recommendedTags.forEach((recommendation) => {
    if (!tags.hasOwnProperty(recommendation)) {
      recomsFound = true;
      let li = document.createElement("li");
      li.textContent = recommendation;
      recoms.appendChild(li);
    }
  });

  return recomsFound;
};

/**
 * @param {object} tags - An object containing the meta tags extracted from the webpage.
 */
const handleFacebookData = (tags) => {
  if (undefined === tags["og:title"] || undefined === tags["og:url"]) {
    hideElements(
      ["fb_links", "fb_article"],
      "fb_error",
      "Insufficient data found. Make sure the following tags are present: og:title, fb_article"
    );
    return;
  }

  document.getElementById("fb_error").textContent = "";

  const fb_recommendations = document.getElementById("fb_recommendations");
  const cardType = tags["og:type"];

  let recommended = [
    "og:url",
    "og:title",
    "og:description",
    "og:image",
    "fb:app_id",
    "og:type",
  ];

  let recomsFound = false;
  switch (cardType) {
    case "link":
      document.getElementById("fb_links").style.display = "block";
      document.getElementById("fb_article").style.display = "none";
      recomsFound = handleRecommendations(
        tags,
        recommended,
        fb_recommendations
      );
      break;

    default:
      document.getElementById("fb_links").style.display = "none";
      document.getElementById("fb_article").style.display = "block";
      recomsFound = handleRecommendations(
        tags,
        recommended,
        fb_recommendations
      );
      break;
  }

  if (recomsFound) {
    fb_recommendations.style.display = "block";
  }

  // Images
  if (undefined === tags["og:image"]) {
    document
      .querySelectorAll("#facebook img")
      .forEach((el) => (el.style.display = "none"));
  } else {
    document
      .querySelectorAll("#facebook img")
      .forEach((el) => (el.src = tags["og:image"]));
  }

  // Url
  document
    .querySelectorAll(".fb_site_domain_light, .fb_site_domain_dark")
    .forEach((el) => (el.textContent = getBaseUrl(tags["og:url"])));

  // Title
  document
    .querySelectorAll(".fb_link_title_light, .fb_link_title_dark")
    .forEach((el) => (el.textContent = tags["og:title"]));

  // Description
  document
    .querySelectorAll(".link_description_light, .link_description_dark")
    .forEach((el) => (el.textContent = tags["og:description"]));
};

/**
 * @param {object} tags - An object containing the meta tags extracted from the webpage.
 */
const handleTwitterData = (tags) => {
  const cardType = tags["twitter:card"];
  if (undefined === cardType) {
    hideElements(
      ["x_previews_large_summary", "x_previews_summary"],
      "x_error",
      "Insufficient data found. Make sure the following tags are present: twitter:card, twitter:title"
    );
    return;
  }

  document.getElementById("x_error").textContent = "";

  const x_recommendations = document.getElementById("x_recommendations");
  const recommended = [
    "og:url",
    "og:title",
    "og:description",
    "twitter:description",
    "twitter:image",
    "twitter:card",
    "twitter:title",
  ];

  let recomsFound = false;
  switch (cardType) {
    case "player":
      recommended.push(
        "twitter:site",
        "twitter:player",
        "twitter:player:width",
        "twitter:player:height",
        "twitter:image"
      );
      recomsFound = handleRecommendations(tags, recommended, x_recommendations);
      document
        .querySelectorAll(".play_icon")
        .forEach((el) => (el.style.display = "block"));
      document.getElementById("x_previews_large_summary").style.display =
        "none";
      document.getElementById("x_previews_summary").style.display = "block";
      break;

    case "app":
      recommended.push(
        "twitter:app:id:iphone",
        "twitter:app:id:ipad",
        "twitter:app:id:googleplay"
      );
      recomsFound = handleRecommendations(tags, recommended, x_recommendations);
      document.getElementById("x_previews_large_summary").style.display =
        "none";
      document.getElementById("x_previews_summary").style.display = "block";
      break;

    case "summary_large_image":
      recomsFound = handleRecommendations(tags, recommended, x_recommendations);
      document.getElementById("x_previews_large_summary").style.display =
        "block";
      document.getElementById("x_previews_summary").style.display = "none";
      break;

    default:
      recomsFound = handleRecommendations(tags, recommended, x_recommendations);
      document.getElementById("x_previews_large_summary").style.display =
        "none";
      document.getElementById("x_previews_summary").style.display = "block";
      break;
  }

  if (recomsFound) {
    x_recommendations.style.display = "block";
  }

  // Images
  if (undefined === tags["og:image"] && undefined === tags["twitter:image"]) {
    document
      .querySelectorAll("#x img")
      .forEach((el) => (el.style.display = "none"));
  } else {
    document
      .querySelectorAll("#x img")
      .forEach((el) => (el.src = tags["twitter:image"] ?? tags["og:image"]));
  }

  // Url
  document
    .querySelectorAll(
      ".twitter_site_domain_light, .twitter_site_domain_dim, .twitter_site_domain_dark, .twitter_site_domain_label"
    )
    .forEach(
      (el) => (el.textContent = getBaseUrl(tags["og:url"] ?? tags["site_name"]))
    );

  // Title
  document
    .querySelectorAll(
      ".twitter_link_title_light, .twitter_link_title_dim, .twitter_link_title_dark"
    )
    .forEach(
      (el) => (el.textContent = tags["twitter:title"] ?? tags["og:title"])
    );

  // Description
  document
    .querySelectorAll(
      ".twitter_link_description_light, .twitter_link_description_dim, .twitter_link_description_dark"
    )
    .forEach(
      (el) =>
        (el.textContent = tags["twitter:description"] ?? tags["og:description"])
    );
};

/**
 * @param {Object} tags - An object containing key-value pairs representing the tags.
 */
const addTableRow = (tags) => {
  const table = document.getElementById("tagTable");
  table.innerHTML = "";

  if (0 === Object.entries(tags).length) {
    table.innerHTML = "<p>No Open Graph tags found.</p>";
  }

  Object.entries(tags)
    .sort()
    .forEach(([key, value]) => {
      const tr = document.createElement("tr");
      const tdPropertyOrName = document.createElement("td");
      const tdContent = document.createElement("td");

      tdPropertyOrName.textContent = key;
      tdContent.textContent = value;

      tr.appendChild(tdPropertyOrName);
      tr.appendChild(tdContent);
      table.appendChild(tr);
    });
};

/**
 * @param {string} key - The key to be checked.
 * @returns {boolean} - True if the key starts with "og:", "fb:", or "twitter:", false otherwise.
 */
const checkOGTag = (key) => {
  return (
    key.startsWith("og:") || key.startsWith("fb:") || key.startsWith("twitter:")
  );
};

const getMetaTags = () => {
  browser.devtools.inspectedWindow.eval(
    `
    Array.from(document.head.querySelectorAll("meta")).map((tag) => {
        return {
          property: tag.getAttribute("property") ?? null,
          name: tag.getAttribute("name") ?? null,
          content: tag.getAttribute("content") ?? null,
        };
    });
    `,
    function (result, isException) {
      if (!isException) {
        // Create an empty object to store the tags
        const tags = {};

        // Iterate over each tag object and add key-value pairs to the tags object
        result.forEach((metaTag) => {
          const key = metaTag.property ?? metaTag.name;
          const value = metaTag.content;

          if (key && value && checkOGTag(key)) {
            tags[key] = value;
          }
        });
        addTableRow(tags);
        handleFacebookData(tags);
        handleTwitterData(tags);
      }
    }
  );
};

// Update data whenever the url changes
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "refresh" || message.action === "turnedon") {
    getMetaTags();
  }

  if (message.action === "turnedoff") {
    hideElements(
      ["x_previews_large_summary", "x_previews_summary"],
      "x_error",
      "Extension disbled, turn on to view data."
    );
    hideElements(
      ["fb_links", "fb_article"],
      "fb_error",
      "Extension disbled, turn on to view data."
    );
  }
});

// Initial data
document.addEventListener("DOMContentLoaded", getMetaTags);
