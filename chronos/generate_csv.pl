#!/usr/bin/perl
use strict;
use warnings;

my $script_path = '/Users/warren/Downloads/warrens-lab-main/chronos/script.js';
my $master_path = '/Users/warren/Downloads/warrens-lab-main/chronos/wikidata_master.js';
my $output_path = '/Users/warren/Downloads/warrens-lab-main/chronos/chronos_master_prep.csv';

my %master_items;
my @ids;

sub parse_js_file {
    my ($path) = @_;
    open(my $fh, '<', $path) or return;
    my $content = do { local $/; <$fh> };
    close($fh);

    # This is a very simple regex parser just for these specific files
    while ($content =~ /\{([^{}]+?)\}/sg) {
        my $block = $1;
        my ($id) = $block =~ /id\s*:\s*["']([^"']+)["']/s;
        my ($title) = $block =~ /title\s*:\s*["']([^"']+)["']/s;
        my ($date) = $block =~ /date\s*:\s*["']([^"']+)["']/s;
        my ($startYear) = $block =~ /startYear\s*:\s*(-?\d+)/s;
        my ($significance) = $block =~ /significance\s*:\s*(\d)/s;
        my ($source) = $block =~ /source\s*:\s*["']([^"']+)["']/s;
        my ($desc) = $block =~ /description\s*:\s*["']([^"']+)["']/s;
        my ($snippet) = $block =~ /snippet\s*:\s*["']([^"']+)["']/s;

        next unless $id;
        
        $master_items{$id} = {
            id => $id,
            title => $title || "",
            date => $date || "",
            startYear => $startYear || 0,
            significance => $significance || 3,
            source => $source || "CURATED",
            description => $desc || $snippet || ""
        };
        push @ids, $id unless grep { $_ eq $id } @ids;
    }
}

parse_js_file($script_path);
parse_js_file($master_path);

# Sort by startYear
@ids = sort { $master_items{$a}->{startYear} <=> $master_items{$b}->{startYear} } @ids;

open(my $out, '>', $output_path) or die $!;
print $out "ID,Title,Date_Display,Year_Numeric,Level,Source,Description\n";

foreach my $id (@ids) {
    my $item = $master_items{$id};
    my $title = $item->{title}; $title =~ s/"/""/g;
    my $desc = $item->{description}; $desc =~ s/"/""/g;
    
    printf $out "%s,\"%s\",%s,%d,%d,%s,\"%s\"\n",
        $id, $title, $item->{date}, $item->{startYear}, $item->{significance}, $item->{source}, $desc;
}
close($out);
print "✅ CSV Generated: chronos_master_prep.csv\n";
