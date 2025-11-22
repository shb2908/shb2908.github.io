---
layout: default
title: Blog
permalink: /blog/
---

# Blog Archive

Here you can find all my writings, thoughts, and updates.

<ul class="post-list">
  {% for post in site.posts %}
    <li>
        <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
        <h3>
          <a class="post-link" href="{{ post.url | relative_url }}">
            {{ post.title | escape }}
          </a>
        </h3>
        {% if post.description %}
          <p>{{ post.description }}</p>
        {% else %}
          <p>{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
        {% endif %}
    </li>
  {% endfor %}
</ul>

