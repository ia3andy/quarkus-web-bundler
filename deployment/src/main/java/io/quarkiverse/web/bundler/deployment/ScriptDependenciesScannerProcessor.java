package io.quarkiverse.web.bundler.deployment;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.jboss.logging.Logger;

import io.quarkiverse.web.bundler.deployment.items.WebDependenciesBuildItem;
import io.quarkus.deployment.annotations.BuildStep;
import io.quarkus.deployment.builditem.ApplicationArchivesBuildItem;
import io.quarkus.deployment.pkg.builditem.CurateOutcomeBuildItem;
import io.quarkus.maven.dependency.Dependency;
import io.quarkus.maven.dependency.DependencyFlags;
import io.quarkus.maven.dependency.ResolvedDependency;
import io.quarkus.paths.PathCollection;

class ScriptDependenciesScannerProcessor {

    private static final Logger LOGGER = Logger.getLogger(ScriptDependenciesScannerProcessor.class);

    @BuildStep
    WebDependenciesBuildItem collectDependencies(ApplicationArchivesBuildItem applicationArchives,
            CurateOutcomeBuildItem curateOutcome,
            WebBundlerConfig config)
            throws IOException {
        List<Path> webDeps = StreamSupport
                .stream(curateOutcome.getApplicationModel().getDependencies(DependencyFlags.REMOVED).spliterator(), true)
                .filter(Dependency::isJar)
                .filter(config.dependencies().type()::matches)
                .map(ResolvedDependency::getResolvedPaths)
                .flatMap(PathCollection::stream)
                .filter(p -> p.getFileName().toString().endsWith(".jar"))
                .collect(Collectors.toList());
        return new WebDependenciesBuildItem(config.dependencies().type(), webDeps);
    }
}
