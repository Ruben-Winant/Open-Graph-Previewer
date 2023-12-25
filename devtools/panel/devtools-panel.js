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
  recoms.innerHTML = "";
  recommended.forEach((recommendation) => {
    if (undefined === tags[recommendation]) {
      recomsFound = true;
      let li = document.createElement("li");
      li.textContent = recommendation;
      recoms.appendChild(li);
    }
  });

  const fb_links = document.getElementById("fb_links");
  const fb_article = document.getElementById("fb_article");
  const facebook_previews = document.getElementById("facebook_previews");
  const fb_recommendations = document.getElementById("fb_recommendations");

  if (recomsFound) {
    fb_recommendations.style.display = "block";
  }

  if (undefined === tags["og:title"]) {
    fb_article.style.display = "none";
    fb_links.style.display = "none";
    facebook_previews.innerHTML = "<p>Insufficient data found.</p>";
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
      fb_links.style.display = "block";
      fb_article.style.display = "none";
      break;
    default:
      fb_links.style.display = "none";
      fb_article.style.display = "block";
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
  recoms.innerHTML = "";
  recommended.forEach((recommendation) => {
    if (undefined === tags[recommendation]) {
      recomsFound = true;
      let li = document.createElement("li");
      li.textContent = recommendation;
      recoms.appendChild(li);
    }
  });

  const x_light_card = document.getElementById("x_light_card");
  const x_dim_card = document.getElementById("x_dim_card");
  const x_dark_card = document.getElementById("x_dark_card");
  const x_previews = document.getElementById("x_previews");
  const x_recommendations = document.getElementById("x_recommendations");

  if (recomsFound) {
    x_recommendations.style.display = "block";
  }

  if (
    undefined === tags["twitter:title"] ||
    undefined === tags["twitter:card"]
  ) {
    x_light_card.style.display = "none";
    x_dim_card.style.display = "none";
    x_dark_card.style.display = "none";
    x_previews.innerHTML = "<p>Insufficient data found.</p>";
    return;
  }

  // Images
  if (undefined === tags["og:image"] && undefined === tags["twitter:image"]) {
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

  // Todo add switch to go over all possible card types and add designs
};

/**
 * Adds rows to an HTML table based on the key-value pairs in the `tags` object.
 * @param {Object} tags - An object containing key-value pairs representing the tags.
 */
const addTableRow = (tags) => {
  const table = document.getElementById("tagTable");
  table.innerHTML = "";

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
  window.addEventListener("popstate", getMetaTags);
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

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "refresh") {
    getMetaTags();
  }
});

document.addEventListener("DOMContentLoaded", getMetaTags);
