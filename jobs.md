---
layout: page
title: Jobs
description: Python Jobs in Nashville
---

### Python Jobs in Nashville

To add a job, make a [Pull Request](https://github.com/pynashorg/pynashorg.github.com)
or email [Jason](https://github.com/pynashorg/pynashorg.github.com). The job must be based
in Nashville, and you must be employed within the organization. It will live for
30 days unless you resubmit it.


{% for job in site.data.jobs %}
<div class="row">
    <div class="col-md-3">
        <a href="#{{ job.position }} ({{ job.type }})">{{ job.company }}</a>
    </div>
    <div class="col-md-5">
        <a href="#{{ job.position }} ({{ job.type }})">{{ job.position }}</a>
    </div>
    <div class="col-md-4">
        {{ job.posted }}
    </div>
</div>
{% endfor %}


{% for job in site.data.jobs %}
<div class="row-fluid">
<a name="{{ job.position }} ({{ job.type }})"></a>
<h2 class="post-title">{{ job.company }}</h2>
<h4 class="post-subtitle">{{ job.position }} ({{ job.type }})</h4>
<p class="post-meta">{{ job.posted }}</p>
{{ job.tech }}

{{ job.description }}

</div>
{% endfor %}
