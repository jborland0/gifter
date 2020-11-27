"""
WSGI config for gifter project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/wsgi/
"""

python_home = '/var/www/django/gifter/gifter-env'

import sys
import site

python_version = '.'.join(map(str, sys.version_info[:2]))
site_packages = python_home + '/lib/python%s/site-packages' % python_version
site.addsitedir(site_packages)

import os
from django.core.wsgi import get_wsgi_application

path = u"/var/www/django/gifter/gifter"

if path not in sys.path:
	sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'gifter.settings'

application = get_wsgi_application()
