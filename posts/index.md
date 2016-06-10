---
layout: post
title: Posts
excerpt: "An archive of articles sorted by date."
---

<section>
		<h2 class="section-heading">POSTS</h2>
		<p class="section-subheading text-muted">An archive of articles sorted by date.</p>
	<div class="entry-content">
	<div class="row">
		<ul class="post-list">
			{% for post in site.posts limit:10 %}
			<li><a href="{{ site.url }}{{ post.url }}"><div class="col-sm-9">{{ post.caption_header }}</div> <div class="col-sm-3 entry-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date_to_string }}</time></div></a></li>
			<div class="clearfix"></div>
			{% endfor %}
		</ul>
	</div>
	</div>
</section>