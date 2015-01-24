---
layout: post
title: Posts
excerpt: "An archive of articles sorted by date."
---

<div class="entry-content">
    <ul class="post-list">
        {% for post in site.posts %} 
        <li><article><a href="{{ site.baseurl }}{{ post.url }}">{{ post.caption_header }} <span class="entry-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time></span></a></article></li>
        {% endfor %}
    </ul>
</div>