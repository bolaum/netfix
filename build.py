#!/usr/bin/env python
import os
import shutil
import json
import zipfile
from collections import OrderedDict

# Constants
DIST_PATH = 'dist/'
REMOVE_BACKGROUND_SCRIPTS = ['lib/hot-reload.js']
REMOVE_PERMISSIONS = ['management']

if __name__ == '__main__':
    # remove dist/ directory
    if os.path.exists(DIST_PATH):
        print('Removing "%s" directory...' % DIST_PATH)
        shutil.rmtree(DIST_PATH)

    print('Creating "%s" directory...' % DIST_PATH)
    os.makedirs(DIST_PATH)

    # remove debug entries in manifest
    with open('manifest.json', 'r') as f:
        mf = json.load(f, object_pairs_hook=OrderedDict)

    # remove background scripts
    print('Removing background scripts %s...' %
          (', '.join('"' + i + '"' for i in REMOVE_BACKGROUND_SCRIPTS)))
    for script in REMOVE_BACKGROUND_SCRIPTS:
        mf['background']['scripts'].remove(script)
    # remove permissions
    print('Removing permissions %s...' %
        (', '.join('"' + i + '"' for i in REMOVE_PERMISSIONS)))
    for perm in REMOVE_PERMISSIONS:
        mf['permissions'].remove(perm)

    # write new manifest
    print('Creating dist manifest...')
    with open(os.path.join(DIST_PATH, 'manifest.json'), 'w') as f:
        json.dump(mf, f, indent=2, separators=(',', ': '))

    # copy files in new manifest do dist/ directory
    with open(os.path.join(DIST_PATH, 'manifest.json'), 'r') as f:
        mf = json.load(f)

    print('Copying files...')

    # create directories if needed
    def create_dist_dirs(fn):
        path = os.path.dirname(os.path.join(DIST_PATH, fn))
        if not os.path.exists(path):
            os.makedirs(path)

    # copy icons
    for fn in mf['icons'].itervalues():
        create_dist_dirs(fn)
        shutil.copy(fn, os.path.join(DIST_PATH, fn))

    # copy background scripts files
    for ftype in ['scripts']:
        for fn in mf['background'][ftype]:
            create_dist_dirs(fn)
            shutil.copy(fn, os.path.join(DIST_PATH, fn))

    # copy content scripts files
    for entry in mf['content_scripts']:
        for ftype in ['css', 'js']:
            for fn in entry[ftype]:
                create_dist_dirs(fn)
                shutil.copy(fn, os.path.join(DIST_PATH, fn))

    # creating zip file
    zipfn = "netfix_%s.zip" % mf['version']
    print('Creating "%s"...' % zipfn)
    zf = zipfile.ZipFile(os.path.join(DIST_PATH, zipfn), "w")
    for dirname, _, files in os.walk(DIST_PATH):
        dirname = os.path.relpath(dirname, DIST_PATH)
        if dirname != '.':
            zf.write(dirname)
        for fn in files:
            if fn == zipfn: continue
            zf.write(os.path.join(DIST_PATH, dirname, fn), os.path.join(dirname, fn))
    zf.close()
