{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.psutils
    pkgs.lsof
  ];
}
