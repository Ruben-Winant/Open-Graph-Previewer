/**
 * @param {string} fullUrl
 * @returns {string}
 */
const getBaseUrl = (fullUrl) => {
  const url = new URL(fullUrl);
  let hostname = url.hostname;

  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  return hostname;
};

const handleFacebookData = (tags) => {
  let recommended = [
    "og:url",
    "og:title",
    "og:description",
    "og:image",
    "fb:app_id",
    "og:type",
  ];

  let recomsFound = false;
  let recoms = document.querySelector("#fb_recommendations ul");
  recommended.forEach((recommendation) => {
    if (undefined === tags[recommendation]) {
      recomsFound = true;
      let li = document.createElement("li");
      li.textContent = recommendation;
      recoms.appendChild(li);
    }
  });

  if (recomsFound) {
    document.getElementById("fb_recommendations").style.display = "block";
  }

  if (undefined === tags["og:title"]) {
    document.getElementById("fb_article").style.display = "none";
    document.getElementById("fb_links").style.display = "none";
    document.getElementById("facebook_previews").innerHTML =
      "<p>Insufficient data found.</p>";
    return;
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

  // Show either link or article styling
  switch (tags["og:type"]) {
    case "link":
      document.getElementById("fb_links").style.display = "block";
      document.getElementById("fb_article").style.display = "none";
      break;
    default:
      document.getElementById("fb_links").style.display = "none";
      document.getElementById("fb_article").style.display = "block";
      break;
  }
};

const handleTwitterData = (tags) => {
  let recommended = [
    "og:url",
    "og:title",
    "og:description",
    "twitter:site",
    "twitter:description",
    "twitter:image",
  ];

  let recomsFound = false;
  let recoms = document.querySelector("#x_recommendations ul");
  recommended.forEach((recommendation) => {
    if (undefined === tags[recommendation]) {
      recomsFound = true;
      let li = document.createElement("li");
      li.textContent = recommendation;
      recoms.appendChild(li);
    }
  });

  if (recomsFound) {
    document.getElementById("x_recommendations").style.display = "block";
  }

  if (
    undefined === tags["twitter:title"] ||
    undefined === tags["twitter:card"]
  ) {
    document.getElementById("x_light_card").style.display = "none";
    document.getElementById("x_dim_card").style.display = "none";
    document.getElementById("x_dark_card").style.display = "none";
    document.getElementById("x_previews").innerHTML =
      "<p>Insufficient data found.</p>";
    return;
  }

  // Images
  if (undefined === tags["og:image"]) {
    document
      .querySelectorAll("#x img")
      .forEach((el) => (el.style.display = "none"));
  } else {
    document
      .querySelectorAll("#x img")
      .forEach((el) => (el.src = tags["og:image"]));
  }

  // Url
  document
    .querySelectorAll(
      ".twitter_site_domain_light, .twitter_site_domain_dim, .twitter_site_domain_dark"
    )
    .forEach((el) => (el.textContent = getBaseUrl(tags["og:url"])));

  // Title
  document
    .querySelectorAll(
      ".twitter_link_title_light, .twitter_link_title_dim, .twitter_link_title_dark"
    )
    .forEach((el) => (el.textContent = tags["twitter:title"]));

  // Description
  document
    .querySelectorAll(
      ".twitter_link_description_light, .twitter_link_description_dim, .twitter_link_description_dark"
    )
    .forEach((el) => (el.textContent = tags["og:description"]));
};

/**
 * Adds rows to an HTML table based on the key-value pairs in the `tags` object.
 * @param {Object} tags - An object containing key-value pairs representing the tags.
 */
const addTableRow = (tags) => {
  const table = document.getElementById("tagTable");

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

          if (key && value) {
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

document.addEventListener("DOMContentLoaded", getMetaTags);

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "refresh") {
    console.log("yooo");
    browser.devtools.inspectedWindow.eval(`console.log('test');`);
    getMetaTags();
  }
});
